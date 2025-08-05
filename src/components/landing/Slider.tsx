'use client'

import { cn } from '@/lib/utils'
import { LucideChevronLeft, LucideChevronRight } from 'lucide-react'
import { memo, ReactNode, useCallback, useRef } from 'react'
import { Button } from '../ui/button'

interface SliderProps {
  children: ReactNode
  className?: string
}

function Slider({ children, className }: SliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((right: boolean) => {
    if (!containerRef.current) return
    const container = containerRef.current

    const childWidth = container.scrollWidth / container.children.length
    const scrollAmount = Math.floor(container.scrollLeft + (right ? childWidth : -childWidth))
    container.scrollTo({
      left: scrollAmount,
      behavior: 'smooth',
    })
  }, [])

  return (
    <div className="relative w-full">
      <Button
        className="absolute left-0 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border border-primary/50 shadow-md md:-translate-x-1/2"
        size="icon"
        onClick={() => scroll(false)}
      >
        <LucideChevronLeft />
      </Button>
      <Button
        className="absolute right-0 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border border-primary/50 shadow-md md:translate-x-1/2"
        size="icon"
        onClick={() => scroll(true)}
      >
        <LucideChevronRight />
      </Button>
      <div
        className={cn('flex w-full snap-x snap-mandatory overflow-x-auto', className)}
        ref={containerRef}
      >
        {children}
      </div>
    </div>
  )
}

export default memo(Slider)
