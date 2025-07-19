import { useState } from "react";
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
} from "lucide-react";
import NotificationPanel from "../notifications/NotificationPanel";
import NotificationSettings from "../notifications/NotificationSettings";
import GlobalSearch from "../search/GlobalSearch";

const Header = ({ onMobileSidebarToggle }) => {
  const { user } = useAuth();
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
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const unreadCount = getUnreadCount();

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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:block">
              <kbd className="inline-flex items-center px-2 py-1 text-xs font-sans font-medium text-gray-400 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded">
                ⌘K
              </kbd>
            </div>
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
            onClick={() => setShowNotificationSettings(true)}
            className="hidden sm:block p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Notification Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <img
                src={user?.avatar || "/api/placeholder/32/32"}
                alt={user?.name || "User"}
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || "User"}
              </span>
              <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
            </button>

            {showProfileDropdown && (
              <div className="dropdown">
                <a href="/profile" className="dropdown-item">
                  Profile
                </a>
                <a href="/forgot-password" className="dropdown-item">
                  Change Password
                </a>
                <a href="#" className="dropdown-item">
                  Account Settings
                </a>
                <hr className="border-gray-200 dark:border-gray-700" />
                <a
                  href="/logout"
                  className="dropdown-item text-red-600 dark:text-red-400"
                >
                  Logout
                </a>
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

      {/* Notification Settings */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </header>
  );
};

export default Header;
