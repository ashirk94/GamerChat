import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ToastContainer } from 'react-toastify';
import authReducer from './slices/authSlice';
import { apiSlice } from './slices/apiSlice';

// Create a test store with optional preloaded state
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiSlice.reducerPath]: apiSlice.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    preloadedState
  });
};

// Custom render function that includes providers
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <Router>
          <ToastContainer />
          {children}
        </Router>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Mock user data for testing
export const mockUser = {
  _id: 'test-user-id',
  email: 'testuser@example.com',
  displayName: 'testuser',
  fullName: 'Test User',
  bio: 'This is a test user',
  location: 'Test City',
  phone: '1234567890',
  visibility: 'public',
  profilePic: null
};

// Mock authenticated state
export const mockAuthenticatedState = {
  auth: {
    userInfo: mockUser
  }
};

// Mock message data
export const mockMessages = [
  {
    _id: 'msg1',
    sender: 'testuser',
    recipient: 'otheruser',
    text: 'Hello there!',
    timestamp: new Date().toISOString()
  },
  {
    _id: 'msg2',
    sender: 'otheruser',
    recipient: 'testuser',
    text: 'Hi back!',
    timestamp: new Date().toISOString()
  }
];

// Mock group data
export const mockGroups = [
  {
    _id: 'group1',
    name: 'Test Group',
    members: ['testuser', 'otheruser'],
    admin: 'testuser'
  }
];

// Common test setup function
export const setupTest = async (Component, props = {}, options = {}) => {
  const utils = renderWithProviders(<Component {...props} />, options);
  return utils;
};

// Wait for async operations in tests
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
