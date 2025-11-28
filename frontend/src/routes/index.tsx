import { useRoutes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminPage from '../pages/AdminPage';
import FileDetailPage from '../pages/FileDetailPage'; // Import FileDetailPage
import UserManagementPage from '../pages/UserManagementPage'; // Import UserManagementPage
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
      path: '/files/:id',
      element: <FileDetailPage />,
    },
    {
      path: '/admin',
      element: <ProtectedRoute />, // This ensures only admins can access /admin and its children
      children: [
        { path: '', element: <AdminPage /> },
        { path: 'users', element: <UserManagementPage /> }, // New nested route for user management
      ]
    },
    // Add a catch-all or 404 page if desired
    // { path: '*', element: <NotFoundPage /> }
  ]);

  return routes;
};

export default AppRoutes;
