'use client'

import { Message } from '@/components/ai/message'
import { useScrollToBottom } from '@/components/ai/use-scroll-to-bottom'
import { Input } from '@/components/ui/input'
import { useActions } from 'ai/rsc'
import { motion } from 'framer-motion'
import { ReactNode, useRef, useState } from 'react'

export default function Home() {
  const { sendMessage } = useActions()

  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<Array<ReactNode>>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>()

  const suggestedActions = [
    { title: 'Create', label: 'Wallet', action: 'Create a new wallet' },
    { title: 'Set', label: 'A new budget', action: 'Set a new budget' },
    {
      title: 'Add',
      label: 'New category',
      action: 'Add a new category',
    },
    {
      title: 'Add',
      label: 'Transaction',
      action: 'Add a new transaction',
    },
  ]

  return (
    <div className="flex h-dvh flex-row justify-center pb-20 text-primary">
      <div className="flex flex-col justify-between gap-4">
        {/* MARK: Introduction */}
        <div
          ref={messagesContainerRef}
          className="flex h-full w-full flex-col items-center gap-3 overflow-y-scroll"
        >
          {messages.length === 0 && (
            <motion.div className="h-[350px] w-full px-4 pt-20 md:w-[500px] md:px-0">
              <div className="flex flex-col gap-21/2 rounded-lg border p-6 text-sm">
                <p className="text-center text-lg font-semibold">Deewas</p>
                <p className="text-muted-foreground">
                  Deewas is a personal finance assistant that helps you manage your money wisely.
                </p>
              </div>
            </motion.div>
          )}

          {messages.map(message => message)}

          <div ref={messagesEndRef} />
        </div>

        {/* MARK: Suggestions */}
        <div className="mx-auto mb-4 grid w-full gap-2 px-4 sm:grid-cols-2 md:max-w-[500px] md:px-0">
          {messages.length === 0 &&
            suggestedActions.map((action, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.01 * index }}
                key={index}
                className={index > 1 ? 'hidden sm:block' : 'block'}
              >
                <button
                  onClick={async () => {
                    setMessages(messages => [
                      ...messages,
                      <Message
                        key={messages.length}
                        role="user"
                        content={action.action}
                      />,
                    ])
                    const response: ReactNode = await sendMessage(action.action)
                    setMessages(messages => [...messages, response])
                  }}
                  className="flex w-full flex-col rounded-lg border border-zinc-200 p-2 text-left text-sm transition-colors"
                >
                  <span className="font-medium">{action.title}</span>
                  <span className="">{action.label}</span>
                </button>
              </motion.div>
            ))}
        </div>

        {/* MARK: Input */}
        <form
          className="relative flex flex-col items-center gap-2"
          onSubmit={async event => {
            event.preventDefault()

            if (input.trim() !== '') {
              setMessages(messages => [
                ...messages,
                <Message
                  key={messages.length}
                  role="user"
                  content={input}
                />,
              ])

              // if empty
              if (input.trim() !== '') {
                setInput('')
                const response: ReactNode = await sendMessage(input)
                setMessages(messages => [...messages, response])
              }
            }
          }}
        >
          <Input
            ref={inputRef}
            className="w-full max-w-[calc(100dvw-32px)] rounded-md bg-secondary px-2 py-1.5 text-base text-primary outline-none md:max-w-[500px]"
            placeholder="Send a message..."
            value={input}
            onChange={event => {
              setInput(event.target.value)
            }}
          />
        </form>
      </div>
    </div>
  )
}
