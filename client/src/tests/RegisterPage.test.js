import "setimmediate";
import fetchMock from "jest-fetch-mock";
window.HTMLElement.prototype.scrollIntoView = jest.fn();

import React from "react";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import RegisterPage from "../pages/RegisterPage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Mock Redux Toolkit Query hooks locally for this test
jest.mock('../slices/usersApiSlice', () => ({
  useRegisterMutation: jest.fn()
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useNavigate: () => mockNavigate,
}));

const renderComponent = async () => {
	let result;
	await act(async () => {
		result = renderWithProviders(<RegisterPage />);
	});
	return result;
};

beforeEach(() => {
	fetchMock.resetMocks();
	jest.clearAllMocks();
	
	// Setup default mock implementation for useRegisterMutation
	const { useRegisterMutation } = require('../slices/usersApiSlice');
	useRegisterMutation.mockReturnValue([
		jest.fn(() => ({
			unwrap: jest.fn(() => Promise.resolve({ 
				user: { id: 1, displayName: 'Test User', email: 'test@test.com' } 
			}))
		})),
		{ isLoading: false }
	]);
});

describe("RegisterPage", () => {
	test("renders register page correctly", async () => {
		await renderComponent();

		expect(screen.getAllByText(/Sign Up/).length).toBeGreaterThan(0);
		expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Sign Up/i })).toBeInTheDocument();
	});

	test("shows error when passwords do not match", async () => {
		await renderComponent();

		// Fill in the form with mismatched passwords
		fireEvent.change(screen.getByLabelText(/Display Name/i), {
			target: { value: "testuser" }
		});
		fireEvent.change(screen.getByLabelText(/Email Address/i), {
			target: { value: "testuser@example.com" }
		});
		fireEvent.change(screen.getByLabelText(/^Password$/i), {
			target: { value: "password123" }
		});
		fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
			target: { value: "differentpassword" }
		});

		fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Passwords do not match");
		}, { timeout: 3000 });
	});

	test("shows error message when form is submitted with invalid data", async () => {
		const { useRegisterMutation } = require("../slices/usersApiSlice");
		const mockRegister = jest.fn().mockReturnValue({
			unwrap: jest.fn().mockRejectedValue({
				data: { message: "Display Name is required" }
			})
		});
		useRegisterMutation.mockReturnValue([mockRegister, { isLoading: false }]);

		await renderComponent();

		// Submit form with empty display name
		fireEvent.change(screen.getByLabelText(/Email Address/i), {
			target: { value: "testuser@example.com" }
		});
		fireEvent.change(screen.getByLabelText(/^Password$/i), {
			target: { value: "password123" }
		});
		fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
			target: { value: "password123" }
		});

		fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Display Name is required");
		}, { timeout: 3000 });
	});

    test("shows error when form is submitted empty", async () => {
        const { useRegisterMutation } = require("../slices/usersApiSlice");
        const mockRegister = jest.fn().mockReturnValue({
            unwrap: jest.fn().mockRejectedValue({
                data: { message: "Display Name is required" }
            })
        });
        useRegisterMutation.mockReturnValue([mockRegister, { isLoading: false }]);

        await renderComponent();

        fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith({
                displayName: "",
                email: "",
                password: ""
            });
        }, { timeout: 3000 });
    });	test("allows user to input registration data", async () => {
		await renderComponent();

		const displayNameInput = screen.getByLabelText(/Display Name/i);
		const emailInput = screen.getByLabelText(/Email Address/i);
		const passwordInput = screen.getByLabelText(/^Password$/i);
		const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

		fireEvent.change(displayNameInput, { target: { value: "testuser" } });
		fireEvent.change(emailInput, { target: { value: "test@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });

		expect(displayNameInput.value).toBe("testuser");
		expect(emailInput.value).toBe("test@example.com");
		expect(passwordInput.value).toBe("password123");
		expect(confirmPasswordInput.value).toBe("password123");
	});

	test("successfully submits valid registration data", async () => {
		const { useRegisterMutation } = require("../slices/usersApiSlice");
		const mockRegister = jest.fn().mockReturnValue({
			unwrap: jest.fn().mockResolvedValue({
				user: { displayName: "testuser", email: "test@example.com" }
			})
		});
		useRegisterMutation.mockReturnValue([mockRegister, { isLoading: false }]);

		await renderComponent();

		// Fill in valid data
		fireEvent.change(screen.getByLabelText(/Display Name/i), {
			target: { value: "testuser" }
		});
		fireEvent.change(screen.getByLabelText(/Email Address/i), {
			target: { value: "test@example.com" }
		});
		fireEvent.change(screen.getByLabelText(/^Password$/i), {
			target: { value: "password123" }
		});
		fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
			target: { value: "password123" }
		});

		fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

		await waitFor(() => {
			expect(mockRegister).toHaveBeenCalledWith({
				displayName: "testuser",
				email: "test@example.com",
				password: "password123"
			});
		});
	});
});
