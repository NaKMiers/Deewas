'use client'

import { motion } from 'framer-motion'
import { BotIcon, UserIcon } from './icons'
import { ReactNode } from 'react'
import { StreamableValue, useStreamableValue } from 'ai/rsc'
import { Markdown } from './markdown'

export const TextStreamMessage = ({ content }: { content: StreamableValue }) => {
  const [text] = useStreamableValue(content)

  return (
    <motion.div
      className={`flex w-full flex-row gap-4 px-4 first-of-type:pt-20 md:w-[500px] md:px-0`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex size-[24px] flex-shrink-0 flex-col items-center justify-center">
        <BotIcon />
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
      className={`flex w-full flex-row gap-4 px-4 first-of-type:pt-20 md:w-[500px] md:px-0`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex size-[24px] flex-shrink-0 flex-col items-center justify-center">
        {role === 'assistant' ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex w-full flex-col gap-1">
        <div className="flex flex-col gap-4">{content}</div>
      </div>
    </motion.div>
  )
}
