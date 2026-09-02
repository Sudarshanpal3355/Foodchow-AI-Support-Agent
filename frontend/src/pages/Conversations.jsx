import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  MessageSquare,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  Filter,
  X,
  Sparkles,
  Activity,
} from 'lucide-react'

import {
  getConversations,
  getConversation,
} from '../services/chatApi'

function Conversations() {
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadConversations = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getConversations()

      let data = []

      if (Array.isArray(response)) {
        data = response
      } else if (Array.isArray(response?.conversations)) {
        data = response.conversations
      } else if (Array.isArray(response?.data)) {
        data = response.data
      } else if (Array.isArray(response?.data?.conversations)) {
        data = response.data.conversations
      }

      setConversations(data)
    } catch (err) {
      console.error('Failed to load conversations:', err)

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to load conversations.',
      )

      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  const normalizedConversations = useMemo(() => {
    return conversations.map((conversation, index) => {
      const id =
        conversation?.conversation_id ||
        conversation?.conversationId ||
        conversation?.id ||
        `conversation-${index}`

      const messages = Array.isArray(conversation?.messages)
        ? conversation.messages
        : []

      const lastMessage =
        conversation?.last_message ||
        conversation?.lastMessage ||
        messages[messages.length - 1] ||
        null

      const status =
        conversation?.status ||
        (conversation?.requires_escalation
          ? 'escalated'
          : 'active')

      const createdAt =
        conversation?.created_at ||
        conversation?.createdAt ||
        conversation?.timestamp ||
        conversation?.started_at ||
        null

      const updatedAt =
        conversation?.updated_at ||
        conversation?.updatedAt ||
        conversation?.last_activity ||
        createdAt

      return {
        ...conversation,
        id,
        messages,
        lastMessage,
        status: String(status).toLowerCase(),
        createdAt,
        updatedAt,
      }
    })
  }, [conversations])

  const filteredConversations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return normalizedConversations
      .filter((conversation) => {
        if (statusFilter === 'all') return true

        return conversation.status === statusFilter
      })
      .filter((conversation) => {
        if (!search) return true

        const searchableText = [
          conversation.id,
          conversation.title,
          conversation.subject,
          conversation.user_message,
          conversation.lastMessage?.content,
          conversation.lastMessage?.message,
          conversation.lastMessage?.text,
          conversation.intent,
          conversation.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(search)
      })
      .sort((a, b) => {
        const dateA = a.updatedAt
          ? new Date(a.updatedAt).getTime()
          : 0

        const dateB = b.updatedAt
          ? new Date(b.updatedAt).getTime()
          : 0

        return dateB - dateA
      })
  }, [normalizedConversations, searchTerm, statusFilter])

  const metrics = useMemo(() => {
    const total = normalizedConversations.length

    const active = normalizedConversations.filter(
      (conversation) =>
        conversation.status === 'active' ||
        conversation.status === 'open' ||
        conversation.status === 'in_progress',
    ).length

    const resolved = normalizedConversations.filter(
      (conversation) =>
        conversation.status === 'resolved' ||
        conversation.status === 'closed' ||
        conversation.status === 'completed',
    ).length

    const escalated = normalizedConversations.filter(
      (conversation) =>
        conversation.status === 'escalated' ||
        conversation.requires_escalation === true,
    ).length

    return {
      total,
      active,
      resolved,
      escalated,
    }
  }, [normalizedConversations])

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  const openConversation = async (conversation) => {
    try {
      await getConversation(conversation.id)
    } catch (err) {
      console.warn('Could not preload conversation:', err)
    }

    navigate(
      `/chat?conversation=${encodeURIComponent(conversation.id)}`,
    )
  }

  const hasFilters =
    searchTerm.trim() !== '' || statusFilter !== 'all'

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
                <MessageSquare
                  size={22}
                  className="text-orange-400"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Conversations
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Monitor and manage customer support interactions
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadConversations}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {/* Agent status strip */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Sparkles
                size={17}
                className="text-emerald-400"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-200">
                AI Support Agent
              </p>

              <p className="text-xs text-slate-500">
                Conversation monitoring is active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Operational
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Conversations"
            value={metrics.total}
            icon={<MessageSquare size={19} />}
          />

          <MetricCard
            title="Active"
            value={metrics.active}
            icon={<Activity size={19} />}
          />

          <MetricCard
            title="Resolved"
            value={metrics.resolved}
            icon={<CheckCircle2 size={19} />}
          />

          <MetricCard
            title="Escalated"
            value={metrics.escalated}
            icon={<AlertTriangle size={19} />}
          />
        </div>

        {/* Search / filters */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by conversation, intent, message or ID..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-11 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter
                size={17}
                className="text-slate-500"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="min-w-44 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="open">Open</option>
                <option value="in_progress">
                  In Progress
                </option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="completed">
                  Completed
                </option>
                <option value="escalated">
                  Escalated
                </option>
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
              >
                <X size={15} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div>
                <p className="text-sm font-medium text-red-300">
                  Unable to load conversations
                </p>

                <p className="mt-1 text-sm text-red-300/70">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadConversations}
                  className="mt-3 text-sm font-medium text-red-300 underline underline-offset-4 hover:text-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <ConversationSkeleton key={index} />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            clearFilters={clearFilters}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-medium text-slate-300">
                  {filteredConversations.length}{' '}
                  conversation
                  {filteredConversations.length !== 1
                    ? 's'
                    : ''}
                </p>

                <p className="mt-0.5 text-xs text-slate-600">
                  Sorted by most recent activity
                </p>
              </div>
            </div>

            {filteredConversations.map(
              (conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onOpen={() =>
                    openConversation(conversation)
                  }
                />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/10 transition hover:border-slate-700">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
          {icon}
        </div>

        <Bot
          size={17}
          className="text-slate-700"
        />
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-100">
        {value}
      </p>
    </div>
  )
}

function ConversationCard({ conversation, onOpen }) {
  const status = conversation.status
  const title = getConversationTitle(conversation)
  const lastMessage = getLastMessageText(conversation)
  const messageCount = getMessageCount(conversation)

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/10 transition hover:border-slate-700 hover:bg-slate-900">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          {/* Top row */}
          <div className="mb-4 flex flex-wrap items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <MessageSquare size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-slate-100">
                {title}
              </h2>

              <p className="mt-1 truncate text-xs text-slate-500">
                Conversation ID: {conversation.id}
              </p>
            </div>

            <StatusBadge status={status} />
          </div>

          {/* Latest message */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <User size={14} />
                Latest customer activity
              </div>

              <span className="text-xs text-slate-600">
                {formatDate(conversation.updatedAt)}
              </span>
            </div>

            <p className="line-clamp-2 text-sm leading-6 text-slate-300">
              {lastMessage}
            </p>
          </div>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare size={14} />
              {messageCount} message
              {messageCount !== 1 ? 's' : ''}
            </span>

            {conversation.intent && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 capitalize text-slate-400">
                <Bot size={13} />
                {String(conversation.intent).replaceAll(
                  '_',
                  ' ',
                )}
              </span>
            )}

            {conversation.confidence !==
              undefined &&
              conversation.confidence !== null && (
                <span>
                  AI confidence:{' '}
                  <span className="font-semibold text-slate-300">
                    {formatConfidence(
                      conversation.confidence,
                    )}
                  </span>
                </span>
              )}
          </div>
        </div>

        {/* Open action */}
        <div className="shrink-0 lg:pl-4">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300 lg:w-auto"
          >
            Open Conversation
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    active: {
      label: 'Active',
      classes:
        'border-orange-500/20 bg-orange-500/10 text-orange-400',
      icon: <Clock3 size={13} />,
    },
    open: {
      label: 'Open',
      classes:
        'border-orange-500/20 bg-orange-500/10 text-orange-400',
      icon: <Clock3 size={13} />,
    },
    in_progress: {
      label: 'In Progress',
      classes:
        'border-orange-500/20 bg-orange-500/10 text-orange-400',
      icon: <Activity size={13} />,
    },
    resolved: {
      label: 'Resolved',
      classes:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      icon: <CheckCircle2 size={13} />,
    },
    closed: {
      label: 'Closed',
      classes:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      icon: <CheckCircle2 size={13} />,
    },
    completed: {
      label: 'Completed',
      classes:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      icon: <CheckCircle2 size={13} />,
    },
    escalated: {
      label: 'Escalated',
      classes:
        'border-amber-500/20 bg-amber-500/10 text-amber-400',
      icon: <AlertTriangle size={13} />,
    },
  }

  const current = config[status] || {
    label: status
      ? status.replaceAll('_', ' ')
      : 'Unknown',
    classes:
      'border-slate-700 bg-slate-800 text-slate-400',
    icon: <Clock3 size={13} />,
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${current.classes}`}
    >
      {current.icon}
      {current.label}
    </span>
  )
}

function EmptyState({ hasFilters, clearFilters }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
        <MessageSquare
          size={25}
          className="text-slate-500"
        />
      </div>

      <h2 className="text-lg font-semibold text-slate-200">
        No conversations found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? 'No conversations match your current search or status filter.'
          : 'Customer conversations will appear here once they are created.'}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

function ConversationSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-800" />

            <div className="flex-1">
              <div className="h-4 w-56 rounded bg-slate-800" />

              <div className="mt-2 h-3 w-36 rounded bg-slate-800" />
            </div>

            <div className="h-6 w-20 rounded-full bg-slate-800" />
          </div>

          <div className="h-20 rounded-xl bg-slate-800" />

          <div className="mt-4 flex gap-4">
            <div className="h-3 w-24 rounded bg-slate-800" />
            <div className="h-3 w-28 rounded bg-slate-800" />
          </div>
        </div>

        <div className="h-10 w-44 rounded-xl bg-slate-800" />
      </div>
    </div>
  )
}

function getConversationTitle(conversation) {
  return (
    conversation.title ||
    conversation.subject ||
    conversation.intent ||
    'Customer Support Conversation'
  )
}

function getLastMessageText(conversation) {
  const message = conversation.lastMessage

  if (!message) {
    return 'No messages available'
  }

  if (typeof message === 'string') {
    return message
  }

  return (
    message.content ||
    message.message ||
    message.text ||
    'No message content'
  )
}

function getMessageCount(conversation) {
  if (Array.isArray(conversation.messages)) {
    return conversation.messages.length
  }

  if (typeof conversation.message_count === 'number') {
    return conversation.message_count
  }

  if (typeof conversation.messageCount === 'number') {
    return conversation.messageCount
  }

  return 0
}

function formatDate(value) {
  if (!value) {
    return 'Unknown'
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value)
  }

  return parsedDate.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatConfidence(value) {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return '—'
  }

  const percentage =
    numericValue <= 1
      ? numericValue * 100
      : numericValue

  return `${Math.round(percentage)}%`
}

export default Conversations
