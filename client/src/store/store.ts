import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../pages/auth/authSlice';
import conversationReducer from '../pages/dashboard/conversationSlice';
import messageReducer from '../pages/dashboard/messageSlice';
import { apiSlice } from '../apiSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        conversations: conversationReducer,
        messages: messageReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
        settings: settingsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
