import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { UserConversation } from './types/conversation';

type ConversationState = {
    users: UserConversation[];
    selectedConversationUserId: string | null;
};

const initialState: ConversationState = {
    users: [],
    selectedConversationUserId: null,
};

const conversationSlice = createSlice({
    name: 'conversations',
    initialState,
    reducers: {
        setConversationUsers(state, action: PayloadAction<UserConversation[]>) {
            state.users = action.payload;
            const hasSelectedConversation = state.users.some(
                (user) => user.id === state.selectedConversationUserId
            );
            if (!hasSelectedConversation) {
                state.selectedConversationUserId = state.users[0]?.id ?? null;
            }
        },
        upsertConversationUser(state, action: PayloadAction<UserConversation>) {
            const existingIndex = state.users.findIndex(
                (user) => user.id === action.payload.id
            );
            if (existingIndex === -1) {
                state.users.push(action.payload);
                if (!state.selectedConversationUserId) {
                    state.selectedConversationUserId = action.payload.id;
                }
                return;
            }

            state.users[existingIndex] = {
                ...state.users[existingIndex],
                ...action.payload,
            };
        },
        setConversationIdForUser(
            state,
            action: PayloadAction<{ userId: string; conversationId: number }>
        ) {
            state.users = state.users.map((user) =>
                user.id === action.payload.userId
                    ? { ...user, conversationId: action.payload.conversationId }
                    : user
            );
        },
        setUserConnectionStatus(
            state,
            action: PayloadAction<{ userId: string; isConnected: boolean }>
        ) {
            state.users = state.users.map((user) =>
                user.id === action.payload.userId
                    ? { ...user, isConnected: action.payload.isConnected }
                    : user
            );
        },
        selectConversation(state, action: PayloadAction<string>) {
            state.selectedConversationUserId = action.payload;
        },
        clearConversations(state) {
            state.users = [];
            state.selectedConversationUserId = null;
        },
    },
});

export const {
    setConversationUsers,
    upsertConversationUser,
    setConversationIdForUser,
    setUserConnectionStatus,
    selectConversation,
    clearConversations,
} = conversationSlice.actions;

export const selectConversationUsers = (state: RootState) =>
    state.conversations.users;

export const selectSelectedConversationUserId = (state: RootState) =>
    state.conversations.selectedConversationUserId;

export const selectSelectedConversationUser = (state: RootState) => {
    const selectedUserId = state.conversations.selectedConversationUserId;
    if (!selectedUserId) return null;
    return (
        state.conversations.users.find((user) => user.id === selectedUserId) ??
        null
    );
};

export default conversationSlice.reducer;
