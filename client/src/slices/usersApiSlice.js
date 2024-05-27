import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
	baseUrl: "/api",
	prepareHeaders: (headers) => {
		const token = Cookies.get("jwt"); // Retrieve the token from the cookie
		console.log("Token from cookie:", token); // Log token to verify
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		}
		return headers;
	}
});
//import { apiSlice } from "./apiSlice";
const USERS_URL = "/users";

export const userApiSlice = createApi({
	reducerPath: "usersApi",
	baseQuery,
	endpoints: (builder) => ({
		login: builder.mutation({
			query: (data) => ({
				url: `${USERS_URL}/auth`,
				method: "POST",
				body: data
			})
		}),
		logout: builder.mutation({
			query: () => ({
				url: `${USERS_URL}/logout`,
				method: "POST"
			})
		}),
		register: builder.mutation({
			query: (data) => ({
				url: `${USERS_URL}`,
				method: "POST",
				body: data
			})
		}),
		updateUser: builder.mutation({
			query: (data) => {
				const token = Cookies.get("jwt");
				console.log(token);
				return {
					url: `${USERS_URL}/profile`,
					method: "PUT",
					body: data,
					headers: {
						Authorization: `Bearer ${token}`
					}
				};
			}
		}),
		getUserProfile: builder.query({
			query: () => ({
				url: `${USERS_URL}/profile`,
				method: "GET",
				headers: {
					Authorization: `Bearer ${Cookies.get("jwt")}`
				}
			})
		})
	})
});

export const {
	useLoginMutation,
	useLogoutMutation,
	useRegisterMutation,
	useUpdateUserMutation,
	useGetUserProfileQuery
} = userApiSlice;
