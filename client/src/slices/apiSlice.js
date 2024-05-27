import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
	prepareHeaders: (headers, { getState }) => {
		const token = getState().auth.token; // Correct the path to access the token
		if (token) {
			headers.set("authorization", `Bearer ${token}`);
		}
		return headers;
	}
});

export const apiSlice = createApi({
	baseQuery,
	endpoints: (builder) => ({})
});
