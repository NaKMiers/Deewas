'use client'

import Message from '@/components/ai/Message'
import { useScrollToBottom } from '@/components/ai/useScrollToBottom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { personalities } from '@/constants'
import { languages } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import useSettings from '@/hooks/useSettings'
import { refresh } from '@/lib/reducers/loadReducer'
import { setClearChat } from '@/lib/reducers/screenReducer'
import { checkPremium, cn } from '@/lib/utils'
import { useChat } from '@ai-sdk/react'
import { ArrowUp, ChevronDown, Square, Trash } from 'lucide-react'
import moment from 'moment-timezone'
import { useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

export default function AIPage() {
  const { data: session } = useSession()
  const user = session?.user
  const isPremium = checkPremium(user)
  const { refetch: refetchSettings } = useSettings()
  const t = useTranslations('aiPage')
  const locale = useLocale()
  const language = languages.find(l => l.value === locale)?.alternative || 'English'

  const { refreshPoint } = useAppSelector(state => state.load)
  const { settings } = useAppSelector(state => state.settings)
  const clearChat = useAppSelector(state => state.screen.clearChat)
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

  const { stop } = useChat() // Dùng useChat thay vì useCompletion
  const [containerRef, handleScroll, isAtBottom] = useScrollToBottom(messages, status === 'streaming')
  const [refreshed, setRefreshed] = useState<boolean>(false)
  const [openPremiumModal, setOpenPremiumModal] = useState<boolean>(false)

  const samples = [
    t('Hello'),
    t('What can you do?'),
    t('My most expensive expense this month'),
    t('How to limit my spending'),
  ]

  // Sync messages to localStorage (replace AsyncStorage)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('messages', JSON.stringify(messages))
    }
  }, [messages])

  // Load messages from localStorage
  useEffect(() => {
    const message = localStorage.getItem('messages')
    if (message) {
      setMessages(JSON.parse(message))
    }
  }, [setMessages, refreshPoint])

  // Refetch settings to check token limit
  useEffect(() => {
    if (isPremium) return
    if (status === 'ready') {
      refetchSettings()
    }
  }, [refetchSettings, status, isPremium])

  // Auto clear chat
  useEffect(() => {
    if (clearChat) {
      setMessages([])
      stop()
      dispatch(setClearChat(false))
    }
  }, [dispatch, setMessages, stop, clearChat])

  // Check token limit
  const checkTokenLimit = useCallback(() => {
    if (!settings) return false
    if (
      !isPremium &&
      settings.freeTokensUsed > +(process.env.NEXT_PUBLIC_FREE_TOKENS_LIMIT || '10000')
    ) {
      setOpenPremiumModal(true)
      return false
    }
    return true
  }, [settings, isPremium])

  // Handle send message
  const handleSendMessage = useCallback(
    (e?: React.FormEvent) => {
      if (input.trim() === '') return
      if (!checkTokenLimit()) return

      handleSubmit(e)
      handleInputChange({ target: { value: '' } } as any)
      setRefreshed(false)
    },
    [handleInputChange, handleSubmit, checkTokenLimit, input]
  )

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (error) {
      setMessages([])
      localStorage.removeItem('messages')
    }
    stop()
    dispatch(refresh())
  }, [dispatch, setMessages, stop, error])

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
        setRefreshed(true)
        setTimeout(() => dispatch(refresh(true)), 1000)
      }
    }
  }, [dispatch, messages, refreshed])

  return (
    <div className="mx-auto flex h-[calc(100vh-50px)] w-full max-w-3xl flex-col">
      {/* Messages Section */}
      <div className="flex flex-1 flex-col gap-6">
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
          <Card className="shadow-md">
            <CardContent className="flex flex-col items-center justify-center gap-2 p-6">
              <h2 className="text-center text-2xl font-semibold">Deewas</h2>
              <p className="text-center text-muted-foreground">
                {t('Deewas is a personal finance assistant that helps you manage your money wisely')}.
              </p>
            </CardContent>
          </Card>
        )}
        {status === 'submitted' && (
          <div className="-mx-2 flex flex-row items-center py-2">{/* <PulseDot /> */}</div>
        )}
      </div>

      {/* Scroll Down Button */}
      {!isAtBottom && (
        <button
          className="absolute bottom-36 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-primary/5 bg-secondary shadow-lg"
          onClick={() => (containerRef as any).current?.scrollTo({ top: 9999, behavior: 'smooth' })}
        >
          <ChevronDown
            size={25}
            className="opacity-70"
          />
        </button>
      )}

      {/* Input Section */}
      <div className="p-6">
        {messages.length === 0 && (
          <div className="no-scrollbar mb-6 flex space-x-2 overflow-x-auto">
            {samples.map((sample, index) => (
              <button
                key={index}
                className="rounded-lg border border-primary/10 bg-gray-100 px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  if (!checkTokenLimit()) return
                  append({ content: sample, role: 'user' })
                }}
              >
                <span className="text-nowrap text-sm font-medium">{sample}</span>
              </button>
            ))}
          </div>
        )}

        <div className="rounded-3xl shadow-lg">
          <Input
            className="w-full border-none bg-transparent px-2 text-neutral-400 placeholder:text-neutral-400"
            placeholder={t('How can Deewas help?')}
            value={input}
            onChange={e => handleInputChange(e as any)}
            onKeyPress={e => {
              if (e.key === 'Enter') handleSendMessage()
            }}
          />
          <div className="mt-1.5 flex items-center justify-between gap-1.5">
            {/* Clear Chat */}
            <Button
              variant="secondary"
              size="sm"
              disabled={status === 'streaming' || status === 'submitted'}
              onClick={() => {
                setMessages([])
                stop()
              }}
              className={cn(
                'bg-black/10 text-neutral-800',
                (status === 'streaming' || status === 'submitted') && 'opacity-50'
              )}
            >
              <Trash
                size={16}
                className="mr-2"
              />
              {t('Clear')}
            </Button>

            <div className="flex flex-1 items-center justify-end gap-1.5">
              {/* Personality */}
              <Button
                variant="secondary"
                size="sm"
                disabled={status === 'streaming' || status === 'submitted'}
                onClick={() => (window.location.href = '/change-personality')}
                className={cn(
                  'bg-black/10 text-neutral-800',
                  (status === 'streaming' || status === 'submitted') && 'opacity-50'
                )}
              >
                {settings?.personalities && settings?.personalities?.length === 1
                  ? t(personalities[settings?.personalities[0]].title)
                  : t('Mixed personalities')}
              </Button>

              <Button
                size="icon"
                className={cn('bg-primary', input.trim() === '' && status === 'ready' && 'opacity-50')}
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
      </div>
    </div>
  )
}
