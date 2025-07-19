import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  className = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    gray: 'text-gray-600',
    white: 'text-white'
  }

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
      {text && (
        <p className={`mt-2 text-sm ${colorClasses[color]} dark:text-gray-400`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}

export default LoadingSpinner

// Skeleton loading component for better UX
export const SkeletonLoader = ({ className = '', children }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  )
}

// Card skeleton
export const CardSkeleton = () => (
  <SkeletonLoader className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  </SkeletonLoader>
)

// Table skeleton
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <SkeletonLoader className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-4">
        {Array.from({ length: cols }).map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </SkeletonLoader>
)

// Asset card skeleton
export const AssetCardSkeleton = () => (
  <SkeletonLoader className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="flex space-x-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
      <div className="flex justify-between pt-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </SkeletonLoader>
)

// Grid skeleton for asset cards
export const AssetGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <AssetCardSkeleton key={index} />
    ))}
  </div>
)

// Loading states for buttons
export const ButtonSpinner = ({ size = 'sm' }) => (
  <Loader2 className={`${sizeClasses[size]} animate-spin`} />
)

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}