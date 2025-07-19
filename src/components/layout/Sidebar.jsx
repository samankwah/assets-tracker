import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  Home,
  Building,
  CheckSquare,
  Calendar,
  User,
  HelpCircle,
  Moon,
  Sun,
  LogOut,
  Settings
} from 'lucide-react'

const Sidebar = () => {
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Assets', href: '/assets', icon: Building },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const preferences = [
    { name: 'Help Center', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Assets Hub</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="mb-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Main Menu
          </h3>
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  isActive ? 'nav-link-active' : 'nav-link-inactive'
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Preferences
          </h3>
          <div className="space-y-1">
            {preferences.map((item) => (
              <div key={item.name}>
                {item.href ? (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      isActive ? 'nav-link-active' : 'nav-link-inactive'
                    }
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </NavLink>
                ) : (
                  <button className="nav-link-inactive w-full">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                )}
              </div>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="nav-link-inactive w-full"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 mr-3" />
              ) : (
                <Sun className="w-5 h-5 mr-3" />
              )}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="nav-link-inactive w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar