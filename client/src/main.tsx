import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { router } from './router.tsx';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <AuthProvider setAuthUser={() => null}>
                <RouterProvider router={router} />
            </AuthProvider>
        </Provider>
    </StrictMode>
);
