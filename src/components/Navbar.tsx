import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            StackIt
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Ask Question Button */}
                <Link
                  to="/ask"
                  className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Ask Question</span>
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Bell className="h-6 w-6" />
                  </button>
                  {showNotifications && (
                    <NotificationDropdown
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/users/${user.username}`}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="hidden sm:inline font-medium">{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
