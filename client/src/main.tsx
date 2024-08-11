import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './AuthContext.tsx';
import { router } from './router.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider attribute="class">
            <Theme
                accentColor="indigo"
                grayColor="sand"
                radius="large"
                scaling="95%"
            >
                <AuthProvider setAuthUser={() => null}>
                    <RouterProvider router={router} />
                </AuthProvider>
                {/* <ThemePanel /> */}
            </Theme>
        </ThemeProvider>
    </StrictMode>
);
