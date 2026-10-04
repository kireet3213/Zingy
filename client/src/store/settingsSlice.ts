import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
    serverUrl: string;
    turnUrl: string;
}

const initialState: SettingsState = {
    serverUrl:
        localStorage.getItem('serverUrl') || import.meta.env.VITE_API_URL || '',
    turnUrl:
        localStorage.getItem('turnUrl') || import.meta.env.VITE_TURN_URL || '',
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setServerUrl: (state, action: PayloadAction<string>) => {
            state.serverUrl = action.payload;
            localStorage.setItem('serverUrl', action.payload);
        },
        setTurnUrl: (state, action: PayloadAction<string>) => {
            state.turnUrl = action.payload;
            localStorage.setItem('turnUrl', action.payload);
        },
    },
});

export const { setServerUrl, setTurnUrl } = settingsSlice.actions;
export default settingsSlice.reducer;
