import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './AuthContext.tsx';
import { router } from './router.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider setAuthUser={() => null}>
            <RouterProvider router={router} />
        </AuthProvider>
    </StrictMode>
);
