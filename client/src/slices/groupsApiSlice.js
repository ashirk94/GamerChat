import { apiSlice } from "./apiSlice";
const GROUPS_URL = "/groups";

export const groupApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createGroup: builder.mutation({
            query: (data) => ({
                url: GROUPS_URL,
                method: "POST",
                body: data,
            }),
        }),
        getGroups: builder.query({
            query: () => ({
                url: GROUPS_URL,
                method: "GET",
            }),
        }),
        addUserToGroup: builder.mutation({
            query: ({ id, data }) => ({
                url: `${GROUPS_URL}/${id}/add-user`,
                method: "PUT",
                body: data,
            }),
        }),
        getGroupMessages: builder.query({
            query: (groupId) => ({
                url: `${GROUPS_URL}/${groupId}/messages`,
                method: "GET",
            }),
        }),
        sendMessageToGroup: builder.mutation({
            query: ({ groupId, data }) => ({
                url: `${GROUPS_URL}/${groupId}/message`,
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const {
    useCreateGroupMutation,
    useGetGroupsQuery,
    useAddUserToGroupMutation,
    useGetGroupMessagesQuery,
    useSendMessageToGroupMutation,
} = groupApiSlice;
