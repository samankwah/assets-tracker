# Development Guide - Asset Tracker

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git
- VS Code (recommended)

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Prettier
- ESLint

## Project Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd asset-tracker
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Asset Tracker
VITE_STORAGE_PREFIX=asset_tracker_
```

### 3. Start Development Server
```bash
npm run dev
```

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Commit Convention
```
feat: add new asset filtering functionality
fix: resolve dashboard statistics calculation
docs: update API documentation
style: improve mobile responsiveness
refactor: optimize asset store performance
test: add unit tests for auth components
```

### Code Review Process
1. Create feature branch
2. Implement changes
3. Write/update tests
4. Submit pull request
5. Address review feedback
6. Merge to develop

## Coding Standards

### Component Structure
```jsx
// ComponentName.jsx
import { useState, useEffect } from 'react'
import { useStore } from '../stores/store'
import { Icon } from 'lucide-react'

const ComponentName = ({ prop1, prop2 }) => {
  // Hooks
  const [localState, setLocalState] = useState('')
  const { storeValue, storeAction } = useStore()

  // Effects
  useEffect(() => {
    // Effect logic
  }, [])

  // Handlers
  const handleAction = () => {
    // Handler logic
  }

  // Render
  return (
    <div className="component-wrapper">
      {/* Component content */}
    </div>
  )
}

export default ComponentName
```

### File Naming Conventions
- Components: `PascalCase.jsx`
- Hooks: `camelCase.js`
- Utilities: `camelCase.js`
- Constants: `UPPER_SNAKE_CASE.js`
- Styles: `kebab-case.css`

### Import Order
```jsx
// 1. React imports
import React, { useState, useEffect } from 'react'

// 2. Third-party imports
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

// 3. Internal imports
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { API_ENDPOINTS } from '../constants/api'

// 4. Relative imports
import './ComponentName.css'
```

## State Management Guidelines

### When to Use Context
- Global app state (auth, theme)
- Configuration data
- User preferences

### When to Use Zustand
- Feature-specific state
- Complex state logic
- Async operations

### When to Use Local State
- Component-specific UI state
- Form inputs
- Temporary data

## Component Guidelines

### Props Best Practices
```jsx
// Good: Destructured props with defaults
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  onClick 
}) => {
  // Component logic
}

// Good: PropTypes for validation (if using)
Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func
}
```

### Event Handlers
```jsx
// Good: Clear handler names
const handleSubmit = (e) => {
  e.preventDefault()
  // Handle form submission
}

const handleInputChange = (e) => {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
}

// Good: Prevent unnecessary re-renders
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency])
```

## Styling Guidelines

### Tailwind CSS Best Practices
```jsx
// Good: Use semantic class names
<div className="card">
  <div className="card-header">
    <h2 className="card-title">Asset Details</h2>
  </div>
  <div className="card-body">
    <p className="text-gray-600 dark:text-gray-400">
      Property information
    </p>
  </div>
</div>

// Good: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>

// Good: Dark mode support
<button className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Click me
</button>
```

### Custom Components
```css
/* Good: Use @layer for organization */
@layer components {
  .btn {
    @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }
}
```

## Testing Guidelines

### Unit Testing
```jsx
// ComponentName.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ComponentName from './ComponentName'

const renderComponent = (props = {}) => {
  return render(
    <BrowserRouter>
      <ComponentName {...props} />
    </BrowserRouter>
  )
}

describe('ComponentName', () => {
  it('renders correctly', () => {
    renderComponent()
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    const mockFn = jest.fn()
    renderComponent({ onClick: mockFn })
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Testing
```jsx
// Test user flows
describe('Asset Management Flow', () => {
  it('creates a new asset', async () => {
    // 1. Navigate to assets page
    // 2. Click add asset button
    // 3. Fill form
    // 4. Submit form
    // 5. Verify asset appears in list
  })
})
```

## Performance Guidelines

### React Performance
```jsx
// Good: Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>
})

// Good: Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return complexCalculation(data)
}, [data])

// Good: Use useCallback for stable references
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency])
```

### Image Optimization
```jsx
// Good: Lazy loading
<img 
  src={imageSrc} 
  alt="Description"
  loading="lazy"
  className="w-full h-48 object-cover"
/>

// Good: Responsive images
<picture>
  <source media="(min-width: 768px)" srcSet="large.jpg" />
  <source media="(min-width: 480px)" srcSet="medium.jpg" />
  <img src="small.jpg" alt="Description" />
</picture>
```

## Debugging Tips

### React DevTools
- Use React DevTools for component inspection
- Profile component performance
- Track state changes

### Console Debugging
```jsx
// Good: Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}

// Good: Use console.table for objects
console.table(assets)

// Good: Use console.time for performance
console.time('expensive-operation')
// ... operation
console.timeEnd('expensive-operation')
```

### Error Boundaries
```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}
```

## Common Issues & Solutions

### 1. Hydration Mismatch
```jsx
// Problem: Server/client rendering mismatch
// Solution: Use useEffect for client-only code
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) return null
```

### 2. Memory Leaks
```jsx
// Problem: Component unmounted but async operation continues
// Solution: Use cleanup functions
useEffect(() => {
  let isMounted = true
  
  fetchData().then(data => {
    if (isMounted) {
      setData(data)
    }
  })
  
  return () => {
    isMounted = false
  }
}, [])
```

### 3. Infinite Re-renders
```jsx
// Problem: Missing dependencies in useEffect
// Solution: Include all dependencies
useEffect(() => {
  if (user && user.id) {
    fetchUserData(user.id)
  }
}, [user, fetchUserData]) // Include all dependencies
```

## Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deployment Checklist
- [ ] Environment variables set
- [ ] API endpoints configured
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Performance monitoring active
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] CDN configured

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)

### Tools
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [ES7+ React Snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)

### Community
- [React Community](https://reactjs.org/community/support.html)
- [Tailwind CSS Community](https://tailwindcss.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactjs)

---

Happy coding! 🚀