import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
	baseUrl: "/api",
	credentials: "include",
	prepareHeaders: (headers) => {
		const token = Cookies.get("jwt"); // Retrieves the token from the cookie
		if (token) {
			headers.set("Authorization", `Bearer ${token}`); // Sets the token in the headers
		}
		return headers;
	}
});

export const apiSlice = createApi({
	baseQuery,
	endpoints: (builder) => ({})
});
