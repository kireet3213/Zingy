import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterUser } from './pages/RegisterUser.tsx';
import App from './App.tsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <LoginPage />,
            },
        ],
    },
    {
        path: '/register',
        element: <RegisterUser />,
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider attribute="class">
            <Theme
                accentColor="indigo"
                grayColor="sand"
                radius="large"
                scaling="95%"
            >
                <RouterProvider router={router} />
                {/* <ThemePanel /> */}
            </Theme>
        </ThemeProvider>
    </StrictMode>
);
