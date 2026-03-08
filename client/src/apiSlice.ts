import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Message } from '@shared-types/socket';

type MessageApiPayload = {
    id: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    sender: {
        id: string;
        username: string;
    };
};

type GetConversationMessagesResponse = {
    success: boolean;
    messages: MessageApiPayload[];
};

type SendConversationMessageRequest = {
    conversationId: number;
    text: string;
};

type SendConversationMessageResponse = {
    success: boolean;
    message: MessageApiPayload;
};

type ResolveDirectConversationResponse = {
    success: boolean;
    conversationId: number;
};

type ResolveDirectConversationRequest = {
    userId: string;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_URL}/api`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('jwt_secret');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['ConversationMessages'],
    endpoints: (builder) => ({
        getConversationMessages: builder.query<
            GetConversationMessagesResponse,
            { conversationId: number; page?: number; perPage?: number }
        >({
            query: ({ conversationId, page = 1, perPage = 100 }) =>
                `conversations/${conversationId}/messages?page=${page}&perPage=${perPage}`,
            providesTags: (_result, _error, { conversationId }) => [
                { type: 'ConversationMessages', id: conversationId },
            ],
        }),
        sendConversationMessage: builder.mutation<
            SendConversationMessageResponse,
            SendConversationMessageRequest
        >({
            query: ({ conversationId, text }) => ({
                url: `conversations/${conversationId}/messages`,
                method: 'POST',
                body: { text },
            }),
            invalidatesTags: (_result, _error, { conversationId }) => [
                { type: 'ConversationMessages', id: conversationId },
            ],
        }),
        resolveDirectConversation: builder.mutation<
            ResolveDirectConversationResponse,
            ResolveDirectConversationRequest
        >({
            query: ({ userId }) => ({
                url: `conversations/direct/${userId}`,
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useGetConversationMessagesQuery,
    useSendConversationMessageMutation,
    useResolveDirectConversationMutation,
} = apiSlice;

export function mapApiMessageToSocketMessage(
    messagePayload: MessageApiPayload,
    currentUserId: string | null | undefined,
    peerUserId: string
): Message {
    return {
        id: messagePayload.id,
        createdAt: messagePayload.createdAt,
        updatedAt: messagePayload.updatedAt,
        text: messagePayload.text,
        to: peerUserId,
        fromSelf: messagePayload.sender.id === currentUserId,
    };
}
