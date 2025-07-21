import { useEffect, useRef } from 'react'

/**
 * Custom hook to detect clicks outside a referenced element
 * @param {Function} handler - Function to call when click outside is detected
 * @param {boolean} isActive - Whether the hook should be active (default: true)
 * @returns {Object} - Ref object to attach to the element
 */
export const useClickOutside = (handler, isActive = true) => {
  const ref = useRef(null)

  useEffect(() => {
    if (!isActive) return

    const handleClickOutside = (event) => {
      // If the ref doesn't exist or the clicked element is inside the ref, do nothing
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      
      // Call the handler function
      handler(event)
    }

    // Add event listener for both mouse and touch events
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [handler, isActive])

  return ref
}

/**
 * Custom hook to detect clicks outside multiple referenced elements
 * @param {Function} handler - Function to call when click outside is detected
 * @param {boolean} isActive - Whether the hook should be active (default: true)
 * @returns {Function} - Function that returns a ref for each element
 */
export const useMultipleClickOutside = (handler, isActive = true) => {
  const refs = useRef([])

  useEffect(() => {
    if (!isActive) return

    const handleClickOutside = (event) => {
      // Check if the click was inside any of the referenced elements
      const isInsideAnyRef = refs.current.some(ref => 
        ref && ref.contains(event.target)
      )

      if (!isInsideAnyRef) {
        handler(event)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [handler, isActive])

  // Return a function that creates and returns refs
  const createRef = (index) => {
    return (element) => {
      refs.current[index] = element
    }
  }

  return createRef
}

/**
 * Hook for handling escape key presses
 * @param {Function} handler - Function to call when escape is pressed
 * @param {boolean} isActive - Whether the hook should be active (default: true)
 */
export const useEscapeKey = (handler, isActive = true) => {
  useEffect(() => {
    if (!isActive) return

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        handler(event)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [handler, isActive])
}

/**
 * Combined hook for both click outside and escape key
 * @param {Function} handler - Function to call when click outside or escape is detected
 * @param {boolean} isActive - Whether the hook should be active (default: true)
 * @returns {Object} - Ref object to attach to the element
 */
export const useClickOutsideAndEscape = (handler, isActive = true) => {
  const ref = useClickOutside(handler, isActive)
  useEscapeKey(handler, isActive)
  return ref
}

export default useClickOutside