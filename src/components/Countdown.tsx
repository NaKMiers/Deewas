'use client'

import { cn } from '@/lib/utils'
import { memo, useEffect, useRef, useState } from 'react'

interface PriceProps {
  timeType: 'loop' | 'once'
  start?: string
  duration?: number
  expire?: string
  className?: string
}

function CountDown({ timeType, start, duration, expire, className = '' }: PriceProps) {
  // states
  const [timeLeft, setTimeLeft] = useState<number[]>([0, 0, 0])

  // MARK: Effects
  // count down
  useEffect(() => {
    let interval: NodeJS.Timeout

    // get hours, minutes, seconds left
    const getTimesLeft = () => {
      // target time
      const now = new Date().getTime()
      let targetTime: any

      // check time type
      if (timeType === 'once' && expire) {
        targetTime = new Date(expire)
      } else if (timeType === 'loop' && duration && start) {
        const begin = new Date(start).getTime()

        const a = (now - begin) / 1000 / 60 // time distance in minute
        const d = duration // duration in minute
        const b = a / d
        const c = Math.ceil(b) * d
        const t = new Date(begin)
        t.setMinutes(t.getMinutes() + c)
        targetTime = t
      }

      let timeDifference = targetTime - now

      let seconds = 0
      let minutes = 0
      let hours = 0
      if (timeDifference > 0) {
        seconds = Math.floor((timeDifference / 1000) % 60)
        minutes = Math.floor((timeDifference / (1000 * 60)) % 60)
        hours = Math.floor(timeDifference / (1000 * 60 * 60))
      }

      // return hours, minutes, seconds left
      return [hours, minutes, seconds]
    }

    // start count down
    interval = setInterval(() => {
      setTimeLeft(getTimesLeft())

      // check if time is up
      if (timeLeft[0] === 0 && timeLeft[1] === 0 && timeLeft[2] === 0) {
        clearInterval(interval)
      }
    }, 1000)

    // clean up
    return () => clearInterval(interval)
  }, [duration, expire, start, timeType, timeLeft])

  return (
    <div className={cn('flex shrink-0 gap-1', className)}>
      {/* Hours */}
      <div className="flex items-center rounded-sm pl-[2px] pr-[1px]">
        <CounterItem
          value={Math.floor(timeLeft[0] / 10)}
          max={9}
        />
        <CounterItem
          value={timeLeft[0] % 10}
          max={9}
        />
      </div>
      <span>:</span>

      {/* Minutes */}
      <div className="flex items-center rounded-sm pl-[2px] pr-[1px]">
        <CounterItem
          value={Math.floor(timeLeft[1] / 10)}
          max={5}
        />
        <CounterItem
          value={timeLeft[1] % 10}
          max={9}
        />
      </div>
      <span>:</span>

      {/* Seconds */}
      <div className="flex items-center rounded-sm pl-[2px] pr-[1px]">
        <CounterItem
          value={Math.floor(timeLeft[2] / 10)}
          max={5}
        />
        <CounterItem
          value={timeLeft[2] % 10}
          max={9}
        />
      </div>
    </div>
  )
}

export default memo(CountDown)

interface CounterItem {
  max: number
  value: number
  size?: number
  className?: string
}

function CounterItem({ max, value, size = 25, className }: CounterItem) {
  // refs
  const slideTrackRef = useRef<HTMLDivElement>(null)

  // change slide main function
  useEffect(() => {
    if (slideTrackRef.current) {
      let slide = max - value

      if (slide === 0) {
        slideTrackRef.current.style.marginTop = `calc(-${size}px * ${max + 1})`

        setTimeout(() => {
          if (slideTrackRef.current) {
            slideTrackRef.current.style.transition = 'none'
            slideTrackRef.current.style.marginTop = `calc(-${size}px * ${0})`
          }
        }, 210)

        setTimeout(() => {
          if (slideTrackRef.current) {
            slideTrackRef.current.style.transition = 'all 0.2s linear'
          }
        }, 250)
      } else {
        slideTrackRef.current.style.marginTop = `calc(-${size}px * ${slide})`
      }
    }
  }, [max, value, size])

  return (
    <div
      className={`overflow-y-hidden ${className}`}
      style={{ height: size }}
    >
      <div
        className={`trans-200 flex h-full flex-col`}
        ref={slideTrackRef}
      >
        {[...Array.from({ length: max + 1 }, (_, i) => max - i), max].map((n, i) => (
          <span
            className="ml-0.5 flex h-full flex-shrink-0 items-center justify-center rounded-sm bg-secondary px-0.5 text-sm font-semibold text-primary"
            key={i}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}
