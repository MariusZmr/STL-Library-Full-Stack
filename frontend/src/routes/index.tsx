import { useRoutes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminPage from '../pages/AdminPage';
import FileDetailPage from '../pages/FileDetailPage'; // Import FileDetailPage
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  const routes = useRoutes([
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    {
      path: '/',
      element: <HomePage />,
    },
    { // Add the new FileDetailPage route
      path: '/files/:id',
      element: <FileDetailPage />,
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
