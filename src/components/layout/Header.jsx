import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotificationStore } from "../../stores/notificationStore";
import { useGlobalSearch } from "../../hooks/useGlobalSearch";
import {
  Bell,
  MessageSquare,
  Settings,
  Search,
  ChevronDown,
  Menu,
  User,
  Lock,
  LogOut,
} from "lucide-react";
import NotificationPanel from "../notifications/NotificationPanel";
import GlobalSearch from "../search/GlobalSearch";
import toast from 'react-hot-toast';

const Header = ({ onMobileSidebarToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    notifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useGlobalSearch();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const dropdownRef = useRef(null);
  const unreadCount = getUnreadCount();

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileDropdown]);

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const handleChangePasswordClick = () => {
    setShowProfileDropdown(false);
    navigate('/auth/forgot-password');
  };

  const handleSettingsClick = () => {
    setShowProfileDropdown(false);
    navigate('/settings');
  };

  const handleLogoutClick = () => {
    setShowProfileDropdown(false);
    logout();
    toast.success('Successfully logged out');
    navigate('/auth/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileSidebarToggle}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-md ml-4 lg:ml-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets, tasks... "
              onClick={openSearch}
              readOnly
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            />
            {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:block">
              <kbd className="inline-flex items-center px-2 py-1 text-xs font-sans font-medium text-gray-400 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded">
                ⌘K
              </kbd>
            </div> */}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications - Hidden on mobile */}
          <button className="hidden sm:block p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="hidden sm:block p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            title="Settings"
            aria-label="Go to Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
                showProfileDropdown 
                  ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-expanded={showProfileDropdown}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="relative">
                <img
                  src={user?.avatar || "/api/placeholder/32/32"}
                  alt={user?.name || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || "User"}
              </span>
              <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProfileDropdown && (
              <div className="dropdown" role="menu" aria-orientation="vertical">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user?.avatar || "/api/placeholder/40/40"}
                      alt={user?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button 
                    onClick={handleProfileClick}
                    className="dropdown-item w-full text-left flex items-center space-x-3 py-2.5 mx-2 rounded-lg"
                    role="menuitem"
                  >
                    <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={handleChangePasswordClick}
                    className="dropdown-item w-full text-left flex items-center space-x-3 py-2.5 mx-2 rounded-lg"
                    role="menuitem"
                  >
                    <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Change Password</span>
                  </button>
                  <button 
                    onClick={handleSettingsClick}
                    className="dropdown-item w-full text-left flex items-center space-x-3 py-2.5 mx-2 rounded-lg"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Account Settings</span>
                  </button>
                </div>

                <hr className="border-gray-200 dark:border-gray-700 my-1" />
                
                {/* Logout */}
                <div className="py-1">
                  <button
                    onClick={handleLogoutClick}
                    className="dropdown-item w-full text-left flex items-center space-x-3 py-2.5 mx-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
      />

      {/* Global Search */}
      <GlobalSearch isOpen={isSearchOpen} onClose={closeSearch} />
    </header>
  );
};

export default Header;
