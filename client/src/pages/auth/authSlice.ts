import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../store/store';

import { createAppAsyncThunk } from '../../withTypes';
import { User } from '@shared-types/socket';
import { post } from '../../helpers/axios-client';
import { AxiosResponse } from 'axios';

interface AuthState {
    user: User | null;
    status: 'idle' | 'pending' | 'succeeded' | 'rejected';
    errorText?: string;
}

export const login = createAppAsyncThunk(
    'auth/login',
    async (data: Record<string, FormDataEntryValue>) => {
        const response: AxiosResponse<{
            authUser: User;
            secret: string;
            success: boolean;
        }> = await post('auth/login', data).then((response) => {
            localStorage.setItem('jwt_secret', response.data.secret);
            localStorage.setItem(
                'auth_user',
                JSON.stringify(response.data.authUser)
            );
            return response;
        });

        return response.data.authUser;
    }
);

const initialState: AuthState = {
    user: null,
    status: 'pending',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userLogout(state) {
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload;
                state.status = 'succeeded';
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'rejected';
                state.errorText =
                    action.error.message || 'Login Failed due to unknown error';
            })
            .addCase(login.pending, (state) => {
                state.status = 'pending';
            });
    },
});

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentLoginStatus = (state: RootState) => ({
    status: state.auth.status,
    errorText: state.auth.errorText,
});
