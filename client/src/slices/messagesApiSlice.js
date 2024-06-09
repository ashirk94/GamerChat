import { apiSlice } from "./apiSlice";
const MESSAGES_URL = "/messages";

export const messageApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: (userId) => ({
                url: `${MESSAGES_URL}/${userId}`,
                method: "GET",
            }),
        }),
        sendMessage: builder.mutation({
            query: (data) => ({
                url: MESSAGES_URL,
                method: "POST",
                body: data,
            }),
        }),
        markMessagesSeen: builder.mutation({
            query: (data) => ({
                url: `${MESSAGES_URL}/seen`,
                method: "POST",
                body: data,
            }),
        }),
        deleteMessages: builder.mutation({
            query: (data) => ({
                url: `${MESSAGES_URL}/delete`,
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const {
    useGetMessagesQuery,
    useSendMessageMutation,
    useMarkMessagesSeenMutation,
    useDeleteMessagesMutation,
} = messageApiSlice;
