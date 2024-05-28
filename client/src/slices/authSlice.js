import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// authentication functions for the frontend

const initialState = {
	userInfo: localStorage.getItem("userInfo")
		? JSON.parse(localStorage.getItem("userInfo"))
		: null,
	token: localStorage.getItem("token")
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCredentials: (state, action) => {
			state.userInfo = action.payload;
			localStorage.setItem("userInfo", JSON.stringify(action.payload));
			localStorage.setItem("token", action.payload.token);
		},
		logout: (state) => {
			state.userInfo = null;
			localStorage.removeItem("userInfo");
			localStorage.removeItem("token");
		}
	}
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
