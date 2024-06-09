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
import LoginPage from "../pages/LoginPage"; // Import LoginPage
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
                    <LoginPage /> {/* Render LoginPage */}
                </Router>
            </Provider>
        );
    });
};

beforeEach(() => {
    fetchMock.resetMocks();
});

// Renders login page correctly
test("renders login page correctly", async () => {
    await renderComponent();

    expect(screen.getByRole("heading", { name: /Log In/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log In/ })).toBeInTheDocument();
});

// Shows error when form is submitted empty
test("shows error when form is submitted empty", async () => {
    // Mocks the API response for failed login
    fetchMock.mockResponseOnce(
        JSON.stringify({ message: "Please enter all fields to login" }),
        { status: 400 }
    );

    await renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /Log In/ }));

    await waitFor(() => {
        expect(screen.getByText(/Please enter all fields to login/)).toBeInTheDocument();
    });
});
