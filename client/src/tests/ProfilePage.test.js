import "setimmediate";
import fetchMock from "jest-fetch-mock";
window.HTMLElement.prototype.scrollIntoView = jest.fn();

import React from "react";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import { renderWithProviders, createTestStore } from "../test-utils";
import ProfilePage from "../pages/ProfilePage";
import { setCredentials } from "../slices/authSlice";
import { ToastContainer } from "react-toastify";

// Mock Redux Toolkit Query hooks locally for this test
jest.mock('../slices/usersApiSlice', () => ({
  useGetUserProfileQuery: jest.fn(),
  useUpdateUserMutation: jest.fn()
}));

// Mock the API hooks
const mockUserProfileData = {
	_id: "test-user-id",
	email: "testuser@example.com",
	displayName: "testuser",
	fullName: "Test User",
	bio: "This is a test user",
	location: "Test City",
	phone: "1234567890",
	visibility: "public",
	profilePic: null
};

// Create store with authenticated user
const renderComponent = async () => {
	const store = createTestStore();
	store.dispatch(
		setCredentials({
			user: mockUserProfileData
		})
	);
	
	let result;
	await act(async () => {
		result = renderWithProviders(<ProfilePage />, { store });
	});
	return result;
};

beforeEach(() => {
	fetchMock.resetMocks();
	jest.clearAllMocks();
	
	// Setup default mock implementations
	const { useGetUserProfileQuery, useUpdateUserMutation } = require('../slices/usersApiSlice');
	
	useGetUserProfileQuery.mockReturnValue({
		data: mockUserProfileData,
		error: null,
		isLoading: false,
		refetch: jest.fn(() => Promise.resolve({ data: mockUserProfileData }))
	});
	
	useUpdateUserMutation.mockReturnValue([
		jest.fn().mockReturnValue({
			unwrap: jest.fn(() => Promise.resolve(mockUserProfileData))
		}),
		{ isLoading: false }
	]);
});

describe("ProfilePage", () => {
	test("renders profile page correctly", async () => {
		await renderComponent();

		expect(screen.getByText("Profile Information")).toBeInTheDocument();
		expect(screen.getByText("testuser")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /edit profile/i })).toBeInTheDocument();
	});

	test("displays user's profile information", async () => {
		await renderComponent();

		expect(screen.getByText(/Test User/)).toBeInTheDocument();
		expect(screen.getByText(/testuser@example.com/)).toBeInTheDocument();
		expect(screen.getByText(/This is a test user/)).toBeInTheDocument();
		expect(screen.getByText(/Test City/)).toBeInTheDocument();
		expect(screen.getByText(/1234567890/)).toBeInTheDocument();
	});

	test("enters edit mode when edit button is clicked", async () => {
		await renderComponent();

		const editButton = screen.getByRole("button", { name: /edit profile/i });
		fireEvent.click(editButton);

		await waitFor(() => {
			expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
			expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
			expect(screen.getByDisplayValue("testuser@example.com")).toBeInTheDocument();
		});
	});

	test("allows editing profile information", async () => {
		await renderComponent();

		// Enter edit mode
		const editButton = screen.getByRole("button", { name: /edit profile/i });
		fireEvent.click(editButton);

		await waitFor(() => {
			const fullNameInput = screen.getByDisplayValue("Test User");
			fireEvent.change(fullNameInput, { target: { value: "Updated Test User" } });
			expect(fullNameInput.value).toBe("Updated Test User");
		});
	});

	test("saves profile changes when save button is clicked", async () => {
		const { useUpdateUserMutation } = require('../slices/usersApiSlice');
		const mockUpdate = jest.fn().mockReturnValue({
			unwrap: jest.fn(() => Promise.resolve(mockUserProfileData))
		});
		useUpdateUserMutation.mockReturnValue([mockUpdate, { isLoading: false }]);

		await renderComponent();

		// Enter edit mode
		const editButton = screen.getByRole("button", { name: /edit profile/i });
		fireEvent.click(editButton);

		await waitFor(async () => {
			const fullNameInput = screen.getByDisplayValue("Test User");
			fireEvent.change(fullNameInput, { target: { value: "Updated Test User" } });

			const saveButton = screen.getByRole("button", { name: /save/i });
			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockUpdate).toHaveBeenCalled();
			});
		});
	});

	test("displays no profile picture placeholder", async () => {
		await renderComponent();

		expect(screen.getByText("No profile picture")).toBeInTheDocument();
	});

    test("shows loading state", async () => {
        const { useGetUserProfileQuery } = require('../slices/usersApiSlice');
        useGetUserProfileQuery.mockReturnValue({
            data: null,
            error: null,
            isLoading: true,
            refetch: jest.fn(() => Promise.resolve({ data: null }))
        });

        const store = createTestStore();
        
        await act(async () => {
            renderWithProviders(<ProfilePage />, { store });
        });

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });	test("handles profile update error", async () => {
		const { useUpdateUserMutation } = require('../slices/usersApiSlice');
		const mockUpdateError = jest.fn().mockReturnValue({
			unwrap: jest.fn(() => Promise.reject(new Error("Update failed")))
		});
		useUpdateUserMutation.mockReturnValue([mockUpdateError, { isLoading: false }]);

		await renderComponent();

		// Enter edit mode and try to save
		const editButton = screen.getByRole("button", { name: /edit profile/i });
		fireEvent.click(editButton);

		await waitFor(async () => {
			const saveButton = screen.getByRole("button", { name: /save/i });
			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockUpdateError).toHaveBeenCalled();
			});
		});
	});
});
