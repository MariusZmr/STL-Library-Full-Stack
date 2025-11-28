import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, UserRoundCog, Home, LogIn, UserPlus } from 'lucide-react'; // Import icons
import { ThemeToggle } from './ThemeToggle'; // Import ThemeToggle

const getUserNameColorClass = (role: string | undefined) => {
  switch (role) {
    case 'admin':
      return 'text-yellow-500';
    case 'manager':
      return 'text-red-500';
    case 'user':
    default:
      return 'text-white'; // Default to white if role is not specified or unrecognized
  }
};

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-16 flex items-center justify-between w-full px-4">
        <Link to="/" className="text-xl font-bold flex items-center gap-2 hover:text-primary transition-colors">
          <Home className="h-5 w-5" />
          STL Shelf
        </Link>

        <div className="flex items-center gap-x-2 flex-wrap justify-end">
          {isAuthenticated ? (
            <>
              {user?.firstName && (
                <span className="text-sm font-medium flex-shrink-0 text-foreground">
                  Welcome, <span className={`font-bold ${getUserNameColorClass(user?.role)}`}>{user?.firstName}</span>
                </span>
              )} 
              <Link to="/admin" className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1 flex-shrink-0">
                <UserRoundCog className="h-5 w-5" />
                Admin
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1 flex-shrink-0">
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1 flex-shrink-0">
                <LogIn className="h-5 w-5" />
                Login
              </Link>
              <Link to="/register" className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1 flex-shrink-0">
                <UserPlus className="h-5 w-5" />
                Register
              </Link>
            </>
          )}
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
