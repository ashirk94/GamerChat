import "setimmediate";
import fetchMock from "jest-fetch-mock";
window.HTMLElement.prototype.scrollIntoView = jest.fn();

import React from "react";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	act
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter as Router } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import authReducer from "../slices/authSlice";
import { apiSlice } from "../slices/apiSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Mocks store with initial state
const store = configureStore({
	reducer: {
		auth: authReducer,
		[apiSlice.reducerPath]: apiSlice.reducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware)
});

const renderComponent = async () => {
	await act(async () => {
		render(
			<Provider store={store}>
				<Router>
					<ToastContainer />
					<RegisterPage />
				</Router>
			</Provider>
		);
	});
};

beforeEach(() => {
	fetchMock.resetMocks();
});

test("renders register page correctly", async () => {
	await renderComponent();

	expect(screen.getAllByText(/Sign Up/).length).toBeGreaterThan(0);
	expect(screen.getByLabelText(/Display Name/)).toBeInTheDocument();
	expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
	expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
	expect(screen.getAllByLabelText(/Confirm Password/).length).toBeGreaterThan(
		0
	);
	expect(screen.getByRole("button", { name: /Sign Up/ })).toBeInTheDocument();
});

test("shows error when passwords do not match", async () => {
	await renderComponent();

	fireEvent.change(screen.getByLabelText(/Display Name/), {
		target: { value: "testuser" }
	});
	fireEvent.change(screen.getByLabelText(/Email Address/), {
		target: { value: "testuser@example.com" }
	});
	fireEvent.change(screen.getByLabelText(/Password/), {
		target: { value: "password" }
	});
	fireEvent.change(screen.getByLabelText(/Confirm Password/), {
		target: { value: "differentpassword" }
	});

	fireEvent.click(screen.getByRole("button", { name: /Sign Up/ }));

	await waitFor(() => {
		expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument();
	});
});

test("shows error when form is submitted empty", async () => {
	// Mock the API response for failed registration
	fetchMock.mockResponseOnce(
		JSON.stringify({ message: "Please enter all fields to register" }),
		{ status: 400 }
	);

	await renderComponent();

	fireEvent.click(screen.getByRole("button", { name: /Sign Up/ }));

	await waitFor(() => {
		expect(
			screen.getByText(/Please enter all fields to register/)
		).toBeInTheDocument();
	});
});
