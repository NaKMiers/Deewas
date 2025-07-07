'use client'

import Message from '@/components/ai/message'
import { useScrollToBottom } from '@/components/ai/useScrollToBottom'
import ChangePersonalityDrawer from '@/components/dialogs/ChangePersonalityDrawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { personalities } from '@/constants'
import { languages } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { cn } from '@/lib/utils'
import { useChat } from '@ai-sdk/react'
import { ArrowUp, LucideChevronDown, LucideX, Square, Trash } from 'lucide-react'
import moment from 'moment-timezone'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

export default function AIPage() {
  // hooks
  const t = useTranslations('aiPage')
  const locale = useLocale()
  const language = languages.find(l => l.value === locale)?.alternative || 'English'
  const { refreshPoint } = useAppSelector(state => state.load)
  const { settings } = useAppSelector(state => state.settings)
  const dispatch = useAppDispatch()

  const { messages, setMessages, handleInputChange, input, handleSubmit, append, status, error } =
    useChat({
      api: `${process.env.NEXT_PUBLIC_APP_URL}/api/ai`,
      headers: {
        'Content-Type': 'application/json',
        'x-language': language,
        'x-timezone': moment.tz.guess(),
        'x-personalities': JSON.stringify(settings ? settings.personalities : [0]),
      },
      onError: error => console.error(error, 'ERROR'),
    })

  const { stop } = useChat()

  // states
  const [refreshed, setRefreshed] = useState<boolean>(false)

  // refs
  const [containerRef, handleScroll, isAtBottom] = useScrollToBottom(messages, status === 'streaming')

  // values
  const samples = [
    t('Hello'),
    t('What can you do?'),
    t('My most expensive expense this month'),
    t('How to limit my spending'),
  ]

  // init messages
  useEffect(() => {
    const getMessages = async () => {
      // get message from async storage
      const message = localStorage.getItem('messages')
      if (!message) return
      const parsedMessage = JSON.parse(message)
      setMessages(parsedMessage)
    }

    getMessages()
  }, [setMessages, refreshPoint])

  // sync messages to async storage
  useEffect(() => {
    const setMessagesToStorage = async () => {
      if (messages.length === 0) return
      localStorage.setItem('messages', JSON.stringify(messages))
    }

    setMessagesToStorage()
  }, [messages])

  // Handle send message
  const handleSendMessage = useCallback(
    (e?: React.FormEvent) => {
      if (input.trim() === '') return

      handleSubmit(e)
      handleInputChange({ target: { value: '' } } as any)
      setRefreshed(false)
    },
    [handleInputChange, handleSubmit, input]
  )

  // Refresh after tool invocation
  useEffect(() => {
    if (messages.length === 0) return
    const lastMessage: any = messages[messages.length - 1]
    const toolName = lastMessage?.parts?.[1]?.toolInvocation?.toolName

    const toolNames = [
      'create_wallet',
      'update_wallet',
      'delete_wallet',
      'transfer_fund_from_wallet_to_wallet',
      'create_category',
      'update_category',
      'delete_category',
      'create_budget',
      'update_budget',
      'delete_budget',
      'get_all_transactions',
      'create_transaction',
      'update_transaction',
      'delete_transaction',
    ]

    if (toolNames.includes(toolName)) {
      if (!refreshed) {
        console.log('Refreshing messages...')
        setRefreshed(true)
        setTimeout(() => dispatch(refresh(true)), 1000)
      }
    }
  }, [dispatch, messages, refreshed])

  return (
    <div className="mx-auto flex h-[calc(100vh-50px)] w-full max-w-3xl flex-col px-21/2">
      {/* MARK: Messages */}
      <section
        className="flex flex-1 flex-col overflow-y-auto pt-21/2"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {messages.length > 0 ? (
          <>
            {messages.map((m, i) => (
              <Message
                key={i}
                content={m.content}
                parts={m.parts}
                role={m.role as 'assistant' | 'user'}
              />
            ))}
            {error && (
              <div className="flex items-center justify-center gap-6 p-6">
                <p className="text-center text-2xl font-semibold text-muted-foreground">
                  ⚠️ {t('An Error Happens')}. {t('Try again')}!
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="px-21/2">
            <div className="gap-2 rounded-xl border border-primary/10 bg-secondary/50 p-6 shadow-md">
              <h2 className="text-center text-2xl font-semibold">Deewas</h2>
              <p className="text-center text-muted-foreground">
                {t('Deewas is a personal finance assistant that helps you manage your money wisely')}.
              </p>
            </div>
          </div>
        )}
        {status === 'submitted' && (
          <div className="flex gap-1 p-0.5">
            <div className="pulse-dot h-3 w-3 rounded-full bg-primary" />
          </div>
        )}
      </section>

      {/* MARK: Input  */}
      <section className="relative mt-6">
        {!isAtBottom && (
          <button
            className="absolute -top-14 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-primary/10 bg-secondary"
            onClick={() => {
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  top: containerRef.current.scrollHeight,
                  behavior: 'smooth',
                })
              }
            }}
          >
            <LucideChevronDown size={20} />
          </button>
        )}

        {messages.length === 0 && (
          <div className="no-scrollbar mb-21/2 flex space-x-2 overflow-x-auto">
            {samples.map((sample, index) => (
              <button
                key={index}
                className="rounded-lg border border-primary/10 bg-secondary/50 px-4 py-2"
                onClick={() => append({ content: sample, role: 'user' })}
              >
                <span className="text-nowrap text-sm font-medium">{sample}</span>
              </button>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-[url(/images/pre-bg-v-flip.png)] bg-cover bg-center bg-no-repeat p-21/2 shadow-lg">
          <div className="relative">
            <Input
              className={cn(
                'border-0 font-medium text-neutral-800 shadow-none !ring-0 placeholder:text-neutral-500',
                input.trim() !== '' && 'pl-10'
              )}
              placeholder={t('How can Deewas help?')}
              value={input}
              onChange={e => handleInputChange(e as any)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            {input.trim() !== '' && (
              <Button
                className="absolute left-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full"
                onClick={() => handleInputChange({ target: { value: '' } } as any)}
              >
                <LucideX className="text-rose-500" />
              </Button>
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-1.5">
            {/* Clear Chat */}
            <Button
              className={cn('rounded-full !bg-white !text-neutral-800')}
              disabled={status === 'streaming' || status === 'submitted'}
              onClick={() => {
                setMessages([])
                localStorage.removeItem('messages')
                stop()
              }}
            >
              <Trash size={16} />
              {t('Clear')}
            </Button>

            <div className="flex flex-1 items-center justify-end gap-1.5">
              {/* Personality */}
              <ChangePersonalityDrawer
                trigger={
                  <Button
                    className={cn('rounded-full !bg-white !text-neutral-800')}
                    disabled={status === 'streaming' || status === 'submitted'}
                  >
                    {settings?.personalities && settings?.personalities?.length === 1
                      ? t(personalities[settings?.personalities[0]].title)
                      : t('Mixed personalities')}
                  </Button>
                }
              />

              <Button
                size="icon"
                className={cn('rounded-full !bg-white !text-neutral-800')}
                disabled={input.trim() === '' && status === 'ready'}
                onClick={() => {
                  if (status === 'submitted' || status === 'streaming') stop()
                  else handleSendMessage()
                }}
              >
                {status === 'submitted' || status === 'streaming' ? (
                  <Square size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-9 h-0" />
    </div>
  )
}
