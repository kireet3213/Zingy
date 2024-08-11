import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import ErrorPage from './pages/ErrorPage';
import App from './App';
import { RegisterUser } from './pages/RegisterUser';
import { DashboardRoot } from './pages/dashboard/DashboardRoot';

export const router = createBrowserRouter([
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
    {
        path: '/dashboard',
        element: <DashboardRoot />,
    },
]);
