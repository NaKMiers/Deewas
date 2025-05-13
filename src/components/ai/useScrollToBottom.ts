import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

export function useScrollToBottom(
  messages: any[],
  isStreaming: boolean = false
): [RefObject<HTMLDivElement>, (event: React.UIEvent<HTMLDivElement>) => void, boolean] {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // States
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true)

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    const isBottom = scrollHeight - scrollTop - clientHeight < 20
    setIsAtBottom(isBottom)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (isAtBottom || isStreaming) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
    }

    if (isStreaming) {
      intervalRef.current = setInterval(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        })
      }, 100)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [messages, isStreaming, isAtBottom])

  return [containerRef, handleScroll, isAtBottom]
}
