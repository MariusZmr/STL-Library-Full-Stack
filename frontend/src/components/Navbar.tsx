import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, UserRoundCog, Home, LogIn, UserPlus } from 'lucide-react'; // Import icons
import { ThemeToggle } from './ThemeToggle'; // Import ThemeToggle

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-2 hover:text-gray-300">
          <Home className="h-5 w-5" />
          STL Library
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm">Welcome, {user?.name || 'User'}</span>
              <Link to="/admin" className="p-2 rounded hover:bg-gray-700 flex items-center gap-1">
                <UserRoundCog className="h-5 w-5" />
                Admin
              </Link>
              <button onClick={handleLogout} className="p-2 rounded hover:bg-gray-700 flex items-center gap-1">
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="p-2 rounded hover:bg-gray-700 flex items-center gap-1">
                <LogIn className="h-5 w-5" />
                Login
              </Link>
              <Link to="/register" className="p-2 rounded hover:bg-gray-700 flex items-center gap-1">
                <UserPlus className="h-5 w-5" />
                Register
              </Link>
            </>
          )}
          <ThemeToggle /> {/* Add ThemeToggle here */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
