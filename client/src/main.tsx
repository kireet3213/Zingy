import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider attribute="class">
            <Theme
                accentColor="indigo"
                grayColor="sand"
                radius="large"
                scaling="95%"
            >
                <App />
                {/* <ThemePanel /> */}
            </Theme>
        </ThemeProvider>
    </StrictMode>
);
