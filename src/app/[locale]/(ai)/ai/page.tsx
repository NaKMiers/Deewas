'use client'

import { Message } from '@/components/ai/message'
import { useScrollToBottom } from '@/components/ai/use-scroll-to-bottom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from '@/i18n/navigation'
import { useActions } from 'ai/rsc'
import { motion } from 'framer-motion'
import { LucideLoaderCircle, LucideSend, Router } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { ReactNode, useCallback, useRef, useState } from 'react'
import toast from 'react-hot-toast'

function AIPage() {
  // hooks
  const { sendMessage } = useActions()
  const t = useTranslations('aiPage')
  const router = useRouter()
  const locale = useLocale()

  // states
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<Array<ReactNode>>([])
  const [loading, setLoading] = useState<boolean>(false)

  // refs
  const inputRef = useRef<HTMLInputElement>(null)
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>()

  const suggestedActions = [
    { title: t('Create'), label: t('a wallet'), action: t('Create a new wallet') },
    { title: t('Set'), label: t('a new budget'), action: t('Set a new budget') },
    {
      title: t('Add'),
      label: t('a new category'),
      action: t('Add a new category'),
    },
    {
      title: t('Add'),
      label: t('a transaction'),
      action: t('Add a new transaction'),
    },
  ]

  const handleSubmit = useCallback(
    async (e: any) => {
      e.preventDefault()
      if (loading || input.trim() === '') return

      setMessages(messages => [
        ...messages,
        <Message
          key={messages.length}
          role="user"
          content={input}
        />,
      ])

      try {
        setLoading(true)
        setInput('')
        const response: ReactNode = await sendMessage(input)
        setMessages(messages => [...messages, response])
      } catch (err: any) {
        toast.error(t('An error occurred') + '.' + t('Please try again later'))
        router.prefetch('/ai', { locale })
        console.log(err)
      } finally {
        setLoading(false)
        setTimeout(() => {
          inputRef.current?.focus
        }, 200)
      }
    },
    [input, sendMessage, loading, router, locale, t]
  )

  const handleSuggestionClick = useCallback(
    async (action: string) => {
      if (loading) return

      setMessages(messages => [
        ...messages,
        <Message
          key={messages.length}
          role="user"
          content={action}
        />,
      ])

      try {
        setLoading(true)
        const response: ReactNode = await sendMessage(action)
        setMessages(messages => [...messages, response])
      } catch (err: any) {
        toast.error('An error occurred. Please try again later.')
        console.log(err)
      } finally {
        setLoading(false)
      }
    },
    [sendMessage, loading]
  )

  return (
    <div className="flex h-full w-full flex-1 overflow-y-auto overflow-x-hidden px-21/2 py-8 md:px-21">
      <div className="mx-auto flex w-full max-w-[600px] flex-col justify-between gap-4">
        {/* MARK: Messages */}
        <div
          ref={messagesContainerRef}
          className="flex h-full w-full flex-col items-center gap-3 overflow-y-auto"
        >
          {/* Introductions */}
          {messages.length === 0 && (
            <div className="flex flex-col gap-21/2 rounded-lg border-2 border-primary p-21 text-center text-sm shadow-md">
              <p className="text-center text-lg font-semibold">Deewas</p>
              <p className="text-muted-foreground">
                {t('Deewas is a personal finance assistant that helps you manage your money wisely')}.
              </p>
            </div>
          )}

          {messages.map(message => message)}

          <div ref={messagesEndRef} />
        </div>

        {/* MARK: Suggestions */}
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:px-0">
          {messages.length === 0 &&
            suggestedActions.map((action, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.01 * index }}
                key={index}
              >
                <Button
                  variant="outline"
                  onClick={() => handleSuggestionClick(action.action)}
                  className="h-9 w-full gap-1.5 rounded-md border px-2 text-sm"
                >
                  <span className="font-semibold">{action.title}</span>
                  <span className="">{action.label}</span>
                </Button>
              </motion.div>
            ))}
        </div>

        {/* MARK: Input */}
        <form
          className="relative flex h-10 flex-shrink-0 gap-2"
          onSubmit={handleSubmit}
        >
          <Input
            ref={inputRef}
            className="h-full border-2 border-primary text-base shadow-md !ring-0"
            placeholder={`${t('Ask me anything')}...`}
            value={input}
            onChange={event => {
              setInput(event.target.value)
            }}
            autoFocus
          />
          <Button
            className="h-full w-10 shadow-md"
            disabled={input.trim() === '' || loading}
          >
            {loading ? <LucideLoaderCircle className="animate-spin" /> : <LucideSend />}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default AIPage
