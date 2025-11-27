import { useRoutes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminPage from '../pages/AdminPage';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  const routes = useRoutes([
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/admin',
      element: <ProtectedRoute />,
      children: [
        { path: '', element: <AdminPage /> }
      ]
    },
    // Add a catch-all or 404 page if desired
    // { path: '*', element: <NotFoundPage /> }
  ]);

  return routes;
};

export default AppRoutes;
