import { Outlet } from "react-router-dom";
// import { useTheme } from "../../context/ThemeContext";
// import { Sun, Moon } from "lucide-react";

const AuthLayout = () => {
  // const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/api/placeholder/800/1200"
          alt="Manage Assets With Ease"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-8">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-4">Manage Assets With Ease</h2>
            <p className="text-lg opacity-90">
              Never miss an important update. Stay up to date with all assets
              needs and practice effective maintenance you can be proud of.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Theme Toggle */}
          {/* <div className="flex justify-end mb-8">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </button>
          </div> */}

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
