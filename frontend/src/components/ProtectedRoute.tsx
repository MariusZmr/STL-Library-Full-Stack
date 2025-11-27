import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify'; // Import toast

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    toast.warn('You need to log in to access this page.');
    return <Navigate to="/login" replace />;
  }

  // Check for admin role
  if (user?.role !== 'admin') {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />; // Redirect to homepage or a 403 page
  }

  return <Outlet />;
};

export default ProtectedRoute;
