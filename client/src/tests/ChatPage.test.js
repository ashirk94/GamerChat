import "setimmediate";
import fetchMock from "jest-fetch-mock";
window.HTMLElement.prototype.scrollIntoView = jest.fn();

import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ChatPage from "../pages/ChatPage";
import authReducer, { setCredentials } from "../slices/authSlice";
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

const renderComponent = async () => {
	await act(async () => {
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
				<ChatPage />
			</Provider>
		);
	});
};

beforeEach(() => {
	fetchMock.resetMocks();
});

test("displays 'Clear Chat' when clicking on the gear icon", async () => {
	fetchMock.mockResponseOnce(JSON.stringify([])); // Mocks an empty messages response

	await renderComponent();

	const cogButton = screen.getByRole("button", { name: "" }); // Find the gear icon button
	fireEvent.click(cogButton);

	expect(screen.getByText(/Clear Chat/)).toBeInTheDocument();
});

test("displays 'Start New Chat' when selecting new chat", async () => {
	fetchMock.mockResponseOnce(JSON.stringify([])); // Mocks an empty messages response

	await renderComponent();

	const selectChat = screen.getByRole("combobox");
	fireEvent.change(selectChat, { target: { value: "new-recipient" } });

	expect(screen.getByText(/Start New Chat/)).toBeInTheDocument();
});
