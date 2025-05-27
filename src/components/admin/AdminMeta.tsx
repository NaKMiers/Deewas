import { cn } from '@/lib/utils'
import { LucideFilter, LucideListRestart } from 'lucide-react'
import React, { Children, memo, useEffect } from 'react'
import { Button } from '../ui/button'

interface AdminMetaProps {
  children: React.ReactNode
  handleFilter: () => void
  handleResetFilter: () => void
  className?: string
  filterClassName?: string
}

function AdminMeta({
  handleFilter,
  handleResetFilter,
  className,
  filterClassName,
  children,
}: AdminMetaProps) {
  // keyboard event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + F (Filter)
      if (e.altKey && e.key === 'f') {
        e.preventDefault()
        handleFilter()
      }

      // Alt + R (Reset)
      if (e.altKey && e.key === 'r') {
        e.preventDefault()
        handleResetFilter()
      }
    }

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown)

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFilter, handleResetFilter])

  return (
    <div
      className={cn(
        'no-scrollbar text-dark w-full max-w-full self-end overflow-auto rounded-xl bg-secondary p-21 text-primary shadow-lg transition-all duration-300',
        className
      )}
    >
      <div className="grid grid-cols-12 gap-21">
        {/* MARK: children 1 -> n - 1 */}
        {Children.toArray(children).slice(0, -1)}

        {/* MARK: Filter Buttons */}
        <div
          className={cn('col-span-12 flex items-end justify-end gap-2 md:col-span-4', filterClassName)}
        >
          {/* Filter Button */}
          <Button
            title="Alt + Enter"
            onClick={handleFilter}
          >
            Filter
            <LucideFilter
              size={12}
              className="wiggle ml-[6px]"
            />
          </Button>

          {/* Reset Button */}
          <Button
            title="Alt + R"
            onClick={handleResetFilter}
          >
            Reset
            <LucideListRestart
              size={18}
              className="wiggle ml-1"
            />
          </Button>
        </div>

        {/* MARK: children n */}
        {Children.toArray(children).slice(-1)}
      </div>
    </div>
  )
}

export default memo(AdminMeta)
