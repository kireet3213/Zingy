import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
    serverUrl: string;
}

const initialState: SettingsState = {
    serverUrl: localStorage.getItem('serverUrl') || import.meta.env.VITE_API_URL || '',
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setServerUrl: (state, action: PayloadAction<string>) => {
            state.serverUrl = action.payload;
            localStorage.setItem('serverUrl', action.payload);
        },
    },
});

export const { setServerUrl } = settingsSlice.actions;
export default settingsSlice.reducer;
