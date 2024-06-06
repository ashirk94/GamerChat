import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// authentication functions for the frontend


const initialState = {
    userInfo: localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo"))
        : null,
    token: localStorage.getItem("token"),
    profile: null, // Add profile state here
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
            state.token = null;
            state.profile = null; // Clear profile state here
            localStorage.removeItem("userInfo");
            localStorage.removeItem("token");
        },
        setProfile: (state, action) => {
            state.profile = action.payload;
        },
        clearProfile: (state) => {
            state.profile = null;
        }
    }
});

export const { setCredentials, logout, setProfile, clearProfile } = authSlice.actions;

export default authSlice.reducer;
