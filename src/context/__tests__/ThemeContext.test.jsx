import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset body classes
    document.body.className = ''
  })

  it('provides default theme as light', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')
  })

  it('loads theme from localStorage on initialization', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme')
  })

  it('toggles theme from light to dark', () => {
    mockLocalStorage.getItem.mockReturnValue('light')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('toggles theme from dark to light', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('sets theme to specific value', () => {
    mockLocalStorage.getItem.mockReturnValue('light')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('applies dark class to body when theme is dark', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    renderHook(() => useTheme(), { wrapper })

    expect(document.body.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from body when theme is light', () => {
    mockLocalStorage.getItem.mockReturnValue('light')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    renderHook(() => useTheme(), { wrapper })

    expect(document.body.classList.contains('dark')).toBe(false)
  })

  it('updates body class when theme changes', () => {
    mockLocalStorage.getItem.mockReturnValue('light')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    // Initially light theme
    expect(document.body.classList.contains('dark')).toBe(false)

    act(() => {
      result.current.setTheme('dark')
    })

    // After changing to dark theme
    expect(document.body.classList.contains('dark')).toBe(true)

    act(() => {
      result.current.setTheme('light')
    })

    // After changing back to light theme
    expect(document.body.classList.contains('dark')).toBe(false)
  })

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Temporarily suppress console.error for this test
    const originalError = console.error
    console.error = vi.fn()

    expect(() => {
      renderHook(() => useTheme())
    }).toThrow('useTheme must be used within a ThemeProvider')

    console.error = originalError
  })

  it('handles invalid theme values by defaulting to light', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-theme')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')
  })

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')
  })

  it('provides correct isDark value', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.isDark).toBe(true)

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.isDark).toBe(false)
  })

  it('persists theme preference in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('light')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')

    act(() => {
      result.current.toggleTheme()
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('applies theme to document body on mount', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    renderHook(() => useTheme(), { wrapper })

    expect(document.body.classList.contains('dark')).toBe(true)
  })

  it('maintains theme state across multiple renders', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result, rerender } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')

    rerender()

    expect(result.current.theme).toBe('dark')
  })
})