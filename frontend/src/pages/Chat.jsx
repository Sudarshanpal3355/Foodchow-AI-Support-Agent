import {
  Bot,
  CheckCircle2,
  CircleAlert,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Ticket,
} from 'lucide-react'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import {
  getConversation,
  sendChatMessage,
} from '../services/chatApi'


function Chat() {

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()


  const requestedConversationId =
    searchParams.get('conversation')


  const [messages, setMessages] =
    useState([])


  const [input, setInput] =
    useState('')


  const [loading, setLoading] =
    useState(false)


  const [
    conversationId,
    setConversationId,
  ] = useState(
    requestedConversationId || null,
  )


  const [error, setError] =
    useState('')


  const [restoring, setRestoring] =
    useState(
      Boolean(requestedConversationId),
    )


  const textareaRef =
    useRef(null)


  const messagesEndRef =
    useRef(null)


  useEffect(() => {

    async function loadConversation() {

      if (!requestedConversationId) {

        setMessages([])

        setConversationId(null)

        setRestoring(false)

        setError('')

        return

      }


      try {

        setRestoring(true)

        setError('')


        const result =
          await getConversation(
            requestedConversationId,
          )


        if (
          !result ||
          !result.success
        ) {

          throw new Error(
            result?.message ||
              'Unable to load conversation.',
          )

        }


        const conversation =
          result.data


        setConversationId(
          conversation.conversation_id,
        )


        const restoredMessages =
          (
            conversation.messages ||
            []
          ).map((message) => ({

            role: message.role,

            content: message.content,

            intent:
              message.intent ?? null,

            confidence:
              message.confidence ?? null,

            requiresEscalation:
              message.requires_escalation ??
              false,

            ticketId:
              message.ticket_id ??
              null,

          }))


        setMessages(
          restoredMessages,
        )

      } catch (err) {

        console.error(
          'Conversation loading error:',
          err,
        )


        setError(
          err.message ||
            'Unable to restore conversation.',
        )


        setMessages([])

        setConversationId(null)

      } finally {

        setRestoring(false)

      }

    }


    loadConversation()

  }, [
    requestedConversationId,
  ])


  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })

  }, [
    messages,
    loading,
  ])


  function startNewChat() {

    setMessages([])

    setConversationId(null)

    setInput('')

    setError('')

    setSearchParams({})

    textareaRef.current?.focus()

  }


  function useSuggestion(
    suggestion,
  ) {

    setInput(suggestion)

    textareaRef.current?.focus()

  }


  async function handleSendMessage(
    event,
  ) {

    event.preventDefault()


    const message =
      input.trim()


    if (
      !message ||
      loading ||
      restoring
    ) {

      return

    }


    setError('')


    setMessages((previous) => [

      ...previous,

      {
        role: 'user',
        content: message,
      },

    ])


    setInput('')

    setLoading(true)


    try {

      const result =
        await sendChatMessage(
          message,
          conversationId,
        )


      if (
        !result ||
        !result.success
      ) {

        throw new Error(
          result?.message ||
            'Unable to process your request.',
        )

      }


      const data =
        result.data || {}


      if (data.conversation_id) {

        const newConversationId =
          data.conversation_id


        setConversationId(
          newConversationId,
        )


        setSearchParams({

          conversation:
            newConversationId,

        })

      }


      setMessages((previous) => [

        ...previous,

        {
          role: 'assistant',

          content:
            data.response ||
            'No response received.',

          intent:
            data.intent ?? null,

          confidence:
            data.confidence ?? null,

          requiresEscalation:
            data.requires_escalation ??
            false,

          ticketId:
            data.ticket_id ?? null,
        },

      ])

    } catch (err) {

      console.error(
        'Chat error:',
        err,
      )


      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to connect to FoodChow support.',
      )

    } finally {

      setLoading(false)

    }

  }


  return (

    <div className="fc-page">

      {/* =====================================================
          CHAT HEADER
      ===================================================== */}

      <header className="border-b border-[var(--border)] bg-[var(--surface)]">

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

          <div className="flex min-w-0 items-center gap-3">

            {/* AI ICON */}

            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">

              <Bot
                size={20}
                strokeWidth={2}
              />


              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-emerald-500" />

            </div>


            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <h1 className="truncate text-sm font-bold text-[var(--text)]">

                  FoodChow AI

                </h1>


                <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 sm:inline dark:text-emerald-400">

                  ONLINE

                </span>

              </div>


              <p className="truncate text-[10px] text-[var(--muted)]">

                AI Support Agent

              </p>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <Link
              to="/conversations"
              className="hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs font-semibold text-[var(--text-soft)] transition hover:border-[var(--primary-border)] hover:text-[var(--primary)] sm:block"
            >

              Conversations

            </Link>


            <button
              type="button"
              onClick={startNewChat}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-teal-500/20 transition hover:bg-[var(--primary-hover)]"
            >

              <Plus size={15} />

              New Chat

            </button>

          </div>

        </div>


        {conversationId && (

          <div className="border-t border-[var(--border)]">

            <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 text-[10px] sm:px-6">

              <span className="text-[var(--muted)]">

                Conversation

              </span>


              <span className="rounded-md bg-[var(--surface-soft)] px-2 py-1 font-mono text-[var(--text-soft)]">

                {conversationId}

              </span>

            </div>

          </div>

        )}

      </header>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="mx-auto flex min-h-[calc(100vh-150px)] w-full max-w-6xl flex-col px-4 sm:px-6">

        <div className="flex flex-1 flex-col">

          {restoring && (

            <div className="flex flex-1 items-center justify-center py-16">

              <LoadingCard
                text="Restoring conversation..."
              />

            </div>

          )}


          {!restoring &&
            messages.length === 0 && (

              <EmptyChat
                onSuggestion={
                  useSuggestion
                }
              />

            )}


          {!restoring &&
            messages.length > 0 && (

              <div className="flex flex-1 flex-col overflow-y-auto py-7">

                <div className="mx-auto w-full max-w-4xl space-y-5">

                  {messages.map(
                    (
                      message,
                      index,
                    ) => (

                      <MessageBubble
                        key={
                          message.message_id ||
                          index
                        }
                        message={message}
                      />

                    ),
                  )}


                  {loading && (

                    <div className="flex items-start gap-3">

                      <Avatar ai />


                      <div className="rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">

                        <div className="flex items-center gap-2">

                          <Sparkles
                            size={14}
                            className="text-[var(--primary)]"
                          />


                          <span className="text-xs text-[var(--muted)]">

                            FoodChow AI is
                            analyzing

                          </span>


                          <span className="flex gap-1">

                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--primary)]" />

                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--primary)] [animation-delay:120ms]" />

                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--primary)] [animation-delay:240ms]" />

                          </span>

                        </div>

                      </div>

                    </div>

                  )}


                  <div
                    ref={messagesEndRef}
                  />

                </div>

              </div>

            )}

        </div>


        {error && (

          <div className="mx-auto mb-3 w-full max-w-4xl rounded-2xl border border-red-500/20 bg-red-500/5 p-4">

            <div className="flex items-start gap-3">

              <CircleAlert
                size={17}
                className="mt-0.5 shrink-0 text-red-500"
              />


              <div>

                <p className="text-xs font-semibold text-red-600 dark:text-red-400">

                  Unable to process request

                </p>


                <p className="mt-1 text-xs leading-5 text-red-600/70 dark:text-red-400/70">

                  {error}

                </p>

              </div>

            </div>

          </div>

        )}


        {/* =====================================================
            INPUT
        ===================================================== */}

        <div className="sticky bottom-0 mx-auto w-full max-w-4xl bg-[var(--background)] pb-4 pt-2">

          <form
            onSubmit={
              handleSendMessage
            }
          >

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg shadow-slate-900/5 transition focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/5">

              <div className="flex items-end gap-2">

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {

                    if (
                      event.key ===
                        'Enter' &&
                      !event.shiftKey
                    ) {

                      event.preventDefault()

                      handleSendMessage(
                        event,
                      )

                    }

                  }}
                  placeholder="Describe your FoodChow issue..."
                  disabled={
                    loading ||
                    restoring
                  }
                  rows={1}
                  className="min-h-[46px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted-soft)] disabled:opacity-50"
                />


                <button
                  type="submit"
                  disabled={
                    loading ||
                    restoring ||
                    !input.trim()
                  }
                  className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-sm shadow-teal-500/20 transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                >

                  <Send size={15} />


                  <span className="hidden sm:inline">

                    {loading
                      ? 'Sending'
                      : 'Send'}

                  </span>

                </button>

              </div>


              <div className="flex items-center justify-between px-3 pb-1 pt-2">

                <p className="text-[10px] text-[var(--muted-soft)]">

                  Enter to send · Shift + Enter
                  for a new line

                </p>


                <div className="hidden items-center gap-1.5 text-[10px] text-[var(--muted-soft)] sm:flex">

                  <Sparkles size={11} />

                  AI-powered support

                </div>

              </div>

            </div>

          </form>

        </div>

      </main>

    </div>

  )
}


/* =========================================================
   EMPTY CHAT
   ========================================================= */

function EmptyChat({
  onSuggestion,
}) {

  return (

    <div className="flex flex-1 items-center justify-center py-12">

      <div className="w-full max-w-3xl">

        <div className="text-center">

          {/* AI ICON */}

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">

            <Sparkles size={25} />

          </div>


          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">

            FoodChow Support Agent

          </p>


          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">

            How can we help?

          </h2>


          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">

            Ask about orders, payments,
            restaurants, printers, KDS,
            accounts, menus or support tickets.
            The AI agent will investigate the
            issue and provide the next step.

          </p>

        </div>


        <div className="mt-9 grid gap-3 sm:grid-cols-2">

          <SuggestionCard
            icon={
              <MessageSquare size={16} />
            }
            title="Check an order"
            description="Get the latest order status"
            message="Check order ORD-1001"
            onClick={onSuggestion}
          />


          <SuggestionCard
            icon={
              <CircleAlert size={16} />
            }
            title="Payment issue"
            description="Investigate a payment problem"
            message="Why is my payment failing?"
            onClick={onSuggestion}
          />


          <SuggestionCard
            icon={
              <Bot size={16} />
            }
            title="Printer problem"
            description="Check printer status"
            message="Check printer PRN001"
            onClick={onSuggestion}
          />


          <SuggestionCard
            icon={
              <ShieldIcon />
            }
            title="Account issue"
            description="Check an account"
            message="Check account ACC001"
            onClick={onSuggestion}
          />

        </div>

      </div>

    </div>

  )
}


function ShieldIcon() {

  return (

    <CheckCircle2 size={16} />

  )

}


/* =========================================================
   MESSAGE
   ========================================================= */

function MessageBubble({
  message,
}) {

  const isUser =
    message.role === 'user'


  return (

    <div
      className={
        isUser
          ? 'flex justify-end'
          : 'flex justify-start'
      }
    >

      <div
        className={
          isUser
            ? 'flex max-w-[90%] flex-row-reverse items-start gap-3 sm:max-w-[80%]'
            : 'flex max-w-[90%] items-start gap-3 sm:max-w-[80%]'
        }
      >

        <Avatar
          ai={!isUser}
        />


        <div className="min-w-0">

          <div
            className={
              isUser
                ? 'rounded-2xl rounded-tr-md bg-[var(--primary)] px-4 py-3 text-white shadow-sm'
                : 'rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-[var(--text)] shadow-sm'
            }
          >

            <p className="whitespace-pre-wrap text-sm leading-6">

              {message.content}

            </p>

          </div>


          {!isUser && (

            <div className="mt-2 flex flex-wrap items-center gap-1.5">

              {message.intent && (

                <MetadataBadge
                  label="Intent"
                  value={formatIntent(
                    message.intent,
                  )}
                />

              )}


              {message.confidence !==
                null &&
                message.confidence !==
                  undefined && (

                  <MetadataBadge
                    label="Confidence"
                    value={`${Math.round(
                      Number(
                        message.confidence,
                      ) * 100,
                    )}%`}
                  />

                )}


              {message.requiresEscalation && (

                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">

                  <CircleAlert size={11} />

                  Human support

                </span>

              )}


              {message.ticketId && (

                <Link
                  to={`/tickets/${message.ticketId}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary-border)] bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--primary)] transition hover:bg-[var(--primary-soft)]"
                >

                  <Ticket size={11} />

                  {message.ticketId}

                </Link>

              )}

            </div>

          )}

        </div>

      </div>

    </div>

  )
}


function Avatar({
  ai,
}) {

  return (

    <div
      className={
        ai
          ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm'
          : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-soft)] text-[10px] font-bold text-[var(--text-soft)] ring-1 ring-[var(--border)]'
      }
    >

      {ai ? (

        <Bot size={15} />

      ) : (

        'YOU'

      )}

    </div>

  )
}


function MetadataBadge({
  label,
  value,
}) {

  return (

    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[10px] text-[var(--muted)]">

      <span className="mr-1">

        {label}

      </span>


      <span className="font-semibold text-[var(--text-soft)]">

        {value}

      </span>

    </span>

  )
}


function SuggestionCard({
  icon,
  title,
  description,
  message,
  onClick,
}) {

  return (

    <button
      type="button"
      onClick={() =>
        onClick(message)
      }
      className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary-border)] hover:shadow-md"
    >

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary)]">

          {icon}

        </div>


        <div className="min-w-0 flex-1">

          <p className="text-sm font-semibold text-[var(--text)]">

            {title}

          </p>


          <p className="mt-0.5 text-[11px] text-[var(--muted)]">

            {description}

          </p>

        </div>


        <span className="text-[var(--muted-soft)] transition group-hover:translate-x-1 group-hover:text-[var(--primary)]">

          →

        </span>

      </div>


      <p className="mt-4 truncate rounded-xl bg-[var(--surface-soft)] px-3 py-2 font-mono text-[10px] text-[var(--muted)]">

        {message}

      </p>

    </button>

  )
}


function LoadingCard({
  text,
}) {

  return (

    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 shadow-sm">

      <div className="flex items-center gap-3">

        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--primary)]" />


        <p className="text-sm text-[var(--muted)]">

          {text}

        </p>

      </div>

    </div>

  )
}


function formatIntent(intent) {

  if (!intent) return ''


  return String(intent)
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    )

}


export default Chat