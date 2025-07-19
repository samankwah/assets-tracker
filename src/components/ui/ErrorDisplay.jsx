import { AlertTriangle, RefreshCw, X } from 'lucide-react'

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onDismiss, 
  title = 'Something went wrong',
  showRetry = true,
  showDismiss = false,
  className = '',
  variant = 'default' // 'default', 'inline', 'toast'
}) => {
  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error
    }
    
    if (error?.message) {
      return error.message
    }
    
    return 'An unexpected error occurred. Please try again.'
  }

  const variantClasses = {
    default: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6',
    inline: 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4',
    toast: 'bg-red-500 text-white rounded-lg p-4 shadow-lg'
  }

  const textClasses = {
    default: 'text-red-800 dark:text-red-200',
    inline: 'text-red-800 dark:text-red-200',
    toast: 'text-white'
  }

  const iconClasses = {
    default: 'text-red-500',
    inline: 'text-red-400',
    toast: 'text-white'
  }

  const buttonClasses = {
    default: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors',
    inline: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 underline',
    toast: 'bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded transition-colors'
  }

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className={`w-5 h-5 ${iconClasses[variant]} mr-3 flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${textClasses[variant]} mb-1`}>
            {title}
          </h3>
          
          <p className={`text-sm ${textClasses[variant]} opacity-90`}>
            {getErrorMessage(error)}
          </p>
          
          {(showRetry || showDismiss) && (
            <div className="mt-3 flex items-center space-x-3">
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className={`inline-flex items-center text-sm ${buttonClasses[variant]}`}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Try Again
                </button>
              )}
              
              {showDismiss && onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`inline-flex items-center text-sm ${buttonClasses[variant]}`}
                >
                  <X className="w-4 h-4 mr-1" />
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        
        {showDismiss && onDismiss && variant === 'toast' && (
          <button
            onClick={onDismiss}
            className="ml-2 text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorDisplay

// Specific error components for common use cases
export const NetworkError = ({ onRetry, ...props }) => (
  <ErrorDisplay
    error="Network connection failed. Please check your internet connection and try again."
    title="Connection Error"
    onRetry={onRetry}
    showRetry={true}
    {...props}
  />
)

export const NotFoundError = ({ resource = 'resource', onRetry, ...props }) => (
  <ErrorDisplay
    error={`The requested ${resource} could not be found.`}
    title="Not Found"
    onRetry={onRetry}
    showRetry={true}
    {...props}
  />
)

export const ValidationError = ({ errors = {}, ...props }) => {
  const errorMessages = Object.values(errors).flat()
  
  return (
    <ErrorDisplay
      error={errorMessages.join(', ')}
      title="Validation Error"
      showRetry={false}
      {...props}
    />
  )
}

export const UnauthorizedError = ({ onRetry, ...props }) => (
  <ErrorDisplay
    error="You are not authorized to access this resource. Please log in and try again."
    title="Access Denied"
    onRetry={onRetry}
    showRetry={true}
    {...props}
  />
)

// Empty state component (not exactly an error, but related)
export const EmptyState = ({ 
  title = 'No data found',
  description = 'There are no items to display.',
  action,
  icon: Icon = AlertTriangle,
  className = ''
}) => (
  <div className={`text-center py-12 ${className}`}>
    <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {description}
    </p>
    {action && action}
  </div>
)

// Form field error display
export const FieldError = ({ error, className = '' }) => {
  if (!error) return null
  
  return (
    <p className={`text-sm text-red-600 dark:text-red-400 mt-1 ${className}`}>
      {error}
    </p>
  )
}

// Toast error for notifications
export const ErrorToast = ({ error, onDismiss }) => (
  <ErrorDisplay
    error={error}
    title="Error"
    variant="toast"
    onDismiss={onDismiss}
    showDismiss={true}
    showRetry={false}
  />
)