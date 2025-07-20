import { useEffect } from 'react'

const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title
    
    if (title) {
      document.title = `${title} | Asset Tracker`
    } else {
      document.title = 'Asset Tracker - Manage Your Assets With Ease'
    }

    // Cleanup function to restore the previous title when component unmounts
    return () => {
      document.title = previousTitle
    }
  }, [title])
}

export default usePageTitle