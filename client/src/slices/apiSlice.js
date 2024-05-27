import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
	baseUrl: "/api",
	prepareHeaders: (headers) => {
		const token = Cookies.get("jwt"); // Retrieve the token from the cookie
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		}
		return headers;
	}
});

export const apiSlice = createApi({
	baseQuery,
	endpoints: (builder) => ({})
});
