import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ProfilePage from "../pages/ProfilePage";
import authReducer, { setCredentials } from "../slices/authSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiSlice } from "../slices/apiSlice";

// Mocks store with authenticated user
const store = configureStore({
	reducer: {
		auth: authReducer,
		[apiSlice.reducerPath]: apiSlice.reducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware)
});

// Mock the API function
jest.mock("../slices/apiSlice", () => ({
	...jest.requireActual("../slices/apiSlice"),
	useUpdateUserMutation: jest.fn()
}));

const renderComponent = () => {
	store.dispatch(
		setCredentials({
			user: {
				_id: "test-user-id",
				email: "testuser@example.com",
				displayName: "testuser",
				fullName: "Test User",
				bio: "This is a test user",
				location: "Test City",
				phone: "1234567890",
				visibility: "Public"
			}
		})
	);

	render(
		<Provider store={store}>
			<ToastContainer />
			<ProfilePage />
		</Provider>
	);
};

beforeEach(() => {
	fetchMock.resetMocks();
	jest.clearAllMocks();
});

test("renders profile information correctly", async () => {
	renderComponent();

	expect(await screen.findByText(/Profile Information/)).toBeInTheDocument();
	expect(screen.getByText(/Edit Profile/)).toBeInTheDocument();
});

test("toggles edit mode correctly", async () => {
	renderComponent();

	const editButton = await screen.findByText(/Edit Profile/);
	fireEvent.click(editButton);

	expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
	expect(screen.getByLabelText(/Display Name/)).toBeInTheDocument();
	expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
	expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument();
	expect(screen.getByLabelText(/Bio/)).toBeInTheDocument();
	expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
	expect(screen.getByLabelText(/Visibility/)).toBeInTheDocument();
});
