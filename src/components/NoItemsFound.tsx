import { cn } from '@/lib/utils'
import { memo } from 'react'

interface NoItemsFoundProps {
  text: string
  className?: string
}

function NoItemsFound({ text, className }: NoItemsFoundProps) {
  return (
    <div
      className={cn(
        'flex-row items-center justify-center rounded-md border border-primary px-2.5 py-5',
        className
      )}
    >
      <p className="text-center text-xl font-semibold text-muted-foreground">{text}</p>
    </div>
  )
}

export default memo(NoItemsFound)
