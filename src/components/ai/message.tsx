'use client'

import { cn } from '@/lib/utils'
import { StreamableValue, useStreamableValue } from 'ai/rsc'
import { motion } from 'framer-motion'
import { LucideBotMessageSquare, LucideUser } from 'lucide-react'
import { ReactNode } from 'react'
import { Markdown } from './markdown'

export const TextStreamMessage = ({ content }: { content: StreamableValue }) => {
  const [text] = useStreamableValue(content)

  return (
    <motion.div
      className={`flex w-full flex-row gap-4 pr-2`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex size-[24px] flex-shrink-0 flex-col items-center justify-center">
        <LucideBotMessageSquare />
      </div>

      <div className="flex w-full flex-col gap-1">
        <div className="flex flex-col gap-4">
          <Markdown>{text}</Markdown>
        </div>
      </div>
    </motion.div>
  )
}

export const Message = ({
  role,
  content,
}: {
  role: 'assistant' | 'user'
  content: string | ReactNode
}) => {
  return (
    <motion.div
      className={cn('flex w-full gap-4 pr-2', role === 'assistant' ? 'flex-row' : 'flex-row-reverse')}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex size-[24px] flex-shrink-0 flex-col items-center justify-center">
        {role === 'assistant' ? <LucideBotMessageSquare /> : <LucideUser />}
      </div>

      <div className={cn('flex flex-col gap-1', role === 'assistant' ? 'flex-1' : 'items-end')}>
        <div className="flex flex-col gap-4">{content}</div>
      </div>
    </motion.div>
  )
}
