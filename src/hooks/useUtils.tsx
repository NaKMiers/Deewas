import { useCallback } from 'react'
import toast from 'react-hot-toast'

function useUtils() {
  // handle copy
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied: ' + text)
  }, [])

  return { handleCopy }
}

export default useUtils
