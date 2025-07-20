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
  Settings,
  X
} from 'lucide-react'

const MobileSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Assets', href: '/assets', icon: Building },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ]

  const preferences = [
    { name: 'Help Center', icon: HelpCircle },
  ]

  const handleNavClick = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 dark:bg-gray-900 transform transition-transform duration-300 ease-in-out lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Assets Hub</h1>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="mb-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              MAIN MENU
            </h3>
            <div className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    isActive 
                      ? 'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                      : 'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors'
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              PREFERENCES
            </h3>
            <div className="space-y-2">
              {preferences.map((item) => (
                <button
                  key={item.name}
                  className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
                  onClick={handleNavClick}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              ))}
              
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  toggleTheme()
                  handleNavClick()
                }}
                className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 mr-3" />
                ) : (
                  <Sun className="w-5 h-5 mr-3" />
                )}
                Dark Mode
                <div className="ml-auto">
                  <div className={`w-8 h-4 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'} relative transition-colors`}>
                    <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="px-4 py-6">
          <button
            onClick={() => {
              logout()
              onClose()
            }}
            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}

export default MobileSidebar