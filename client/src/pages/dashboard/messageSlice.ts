import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '@shared-types/socket';
import { RootState } from '../../store/store';

type MessageState = {
    byUserId: Record<string, Message[]>;
    unseenCountByUserId: Record<string, number>;
};

const initialState: MessageState = {
    byUserId: {},
    unseenCountByUserId: {},
};

const messageSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessagesForUser(
            state,
            action: PayloadAction<{ userId: string; messages: Message[] }>
        ) {
            state.byUserId[action.payload.userId] = action.payload.messages;
            state.unseenCountByUserId[action.payload.userId] = 0;
        },
        appendMessageForUser(
            state,
            action: PayloadAction<{
                userId: string;
                message: Message;
                markUnseen: boolean;
            }>
        ) {
            const existingMessages =
                state.byUserId[action.payload.userId] ?? [];
            const exists = existingMessages.some(
                (message) => message.id === action.payload.message.id
            );
            if (!exists) {
                state.byUserId[action.payload.userId] = [
                    ...existingMessages,
                    action.payload.message,
                ];
            }
            if (action.payload.markUnseen) {
                const previous =
                    state.unseenCountByUserId[action.payload.userId] ?? 0;
                state.unseenCountByUserId[action.payload.userId] = previous + 1;
            }
        },
        clearMessages(state) {
            state.byUserId = {};
            state.unseenCountByUserId = {};
        },
        resetUnseenForUser(state, action: PayloadAction<string>) {
            state.unseenCountByUserId[action.payload] = 0;
        },
    },
});

export const {
    setMessagesForUser,
    appendMessageForUser,
    clearMessages,
    resetUnseenForUser,
} = messageSlice.actions;

export const selectMessagesByUserId = (
    state: RootState,
    userId: string | null
) => {
    if (!userId) return [];
    return state.messages.byUserId[userId] ?? [];
};

export const selectUnseenCountByUserId = (
    state: RootState,
    userId: string | null
) => {
    if (!userId) return 0;
    return state.messages.unseenCountByUserId[userId] ?? 0;
};

export default messageSlice.reducer;
