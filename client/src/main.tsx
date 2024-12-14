import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './AuthContext.tsx';
import { router } from './router.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Theme
        >
            <AuthProvider setAuthUser={() => null}>
                <RouterProvider router={router} />
            </AuthProvider>
        </Theme>
    </StrictMode>
);
