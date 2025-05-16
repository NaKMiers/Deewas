'use client'

import { cn } from '@/lib/utils'
import { LucideChevronUp } from 'lucide-react'
import { useState } from 'react'

interface CollapseContentsProps {
  data: {
    content: string
    hiddenContent: string
  }[]
  className?: string
}

function CollapseContents({ data, className }: CollapseContentsProps) {
  const [selected, setSelected] = useState<number>(-1)

  return (
    <div className={cn('flex w-full flex-col gap-21/2', className)}>
      {data.map((item, index) => (
        <div
          className="w-full cursor-pointer rounded-lg border border-primary/10 p-21"
          onClick={() => setSelected(selected === index ? -1 : index)}
          key={index}
        >
          <div
            className={cn(
              'trans-200 flex items-center justify-between gap-2',
              selected === index && 'text-sky-500'
            )}
          >
            <p>{item.content}</p>
            <LucideChevronUp size={12} />
          </div>

          <p
            className={cn(
              'trans-200 max-h-0 overflow-hidden text-muted-foreground',
              selected === index && 'mt-6 max-h-[200px]'
            )}
          >
            {item.hiddenContent}
          </p>
        </div>
      ))}
    </div>
  )
}

export default CollapseContents
