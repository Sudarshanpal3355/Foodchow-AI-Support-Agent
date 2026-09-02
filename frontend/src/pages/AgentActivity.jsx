import {
  Activity,
  AlertCircle,
  Bot,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Sparkles,
  Ticket as TicketIcon,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

async function getAgentActivity() {
  const response = await fetch(
    'http://127.0.0.1:8000/api/agent/activity',
  )

  if (!response.ok) {
    throw new Error(
      `Unable to load agent activity. HTTP ${response.status}`,
    )
  }

  return response.json()
}

function AgentActivity() {
  const [activities, setActivities] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  async function loadActivity() {
    try {
      setLoading(true)
      setError('')

      const result =
        await getAgentActivity()

      if (
        !result ||
        !result.success
      ) {
        throw new Error(
          result?.message ||
            'Unable to load agent activity.',
        )
      }

      const normalized =
        (result.data || [])
          .map(normalizeActivity)
          .sort(
            (a, b) =>
              new Date(
                b.timestamp || 0,
              ) -
              new Date(
                a.timestamp || 0,
              ),
          )

      setActivities(normalized)
    } catch (err) {
      console.error(
        'Agent activity loading error:',
        err,
      )

      setError(
        err.message ||
          'Unable to load agent activity.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivity()
  }, [])

  const statistics = useMemo(() => {
    const responses =
      activities.length

    const confidenceValues =
      activities.filter(
        (activity) =>
          activity.confidence !==
            null &&
          activity.confidence !==
            undefined,
      )

    const averageConfidence =
      confidenceValues.length
        ? Math.round(
            (confidenceValues.reduce(
              (
                total,
                activity,
              ) =>
                total +
                Number(
                  activity.confidence,
                ),
              0,
            ) /
              confidenceValues.length) *
              100,
          )
        : 0

    const escalations =
      activities.filter(
        (activity) =>
          activity.requiresEscalation,
      ).length

    const tickets =
      activities.filter(
        (activity) =>
          activity.ticketId,
      ).length

    const tools =
      activities.reduce(
        (total, activity) =>
          total +
          activity.toolsUsed.length,
        0,
      )

    return {
      responses,
      averageConfidence,
      escalations,
      tickets,
      tools,
    }
  }, [activities])

  return (
    <div className="fc-page">
      {/* HEADER */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                <Activity size={12} />
                Observability
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
                Agent Activity
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
                AI agent operations, tools,
                escalations and confidence.
              </p>
            </div>

            <button
              type="button"
              onClick={loadActivity}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--text-soft)] transition hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? 'animate-spin'
                    : ''
                }
              />

              {loading
                ? 'Refreshing'
                : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle
                size={16}
                className="text-red-500"
              />

              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* METRICS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric
            icon={<Bot size={17} />}
            title="AI Responses"
            value={
              statistics.responses
            }
            description="Assistant responses"
          />

          <Metric
            icon={
              <Sparkles size={17} />
            }
            title="Avg Confidence"
            value={`${statistics.averageConfidence}%`}
            description="Model confidence"
            iconClass="text-violet-500"
          />

          <Metric
            icon={
              <Wrench size={17} />
            }
            title="Tool Executions"
            value={
              statistics.tools
            }
            description="Recorded tool calls"
            iconClass="text-cyan-500"
          />

          <Metric
            icon={
              <AlertCircle size={17} />
            }
            title="Escalations"
            value={
              statistics.escalations
            }
            description="Human support"
            iconClass="text-amber-500"
          />

          <Metric
            icon={
              <TicketIcon size={17} />
            }
            title="Tickets Created"
            value={
              statistics.tickets
            }
            description="Support cases"
            iconClass="text-emerald-500"
          />
        </section>

        {/* ACTIVITY */}
        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[var(--text)]">
                  Recent Agent Activity
                </h2>

                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  LIVE DATA
                </span>
              </div>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Operational events recorded by
                the AI support agent.
              </p>
            </div>

            <Link
              to="/conversations"
              className="text-xs font-bold text-blue-600 dark:text-blue-400"
            >
              View Conversations →
            </Link>
          </div>

          {loading && (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-blue-500" />
                Loading agent activity...
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            activities.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                  <Zap size={21} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-[var(--text)]">
                  No agent activity yet
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--muted)]">
                  Activity will appear after the
                  AI processes customer messages.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            activities.length > 0 && (
              <div className="space-y-4">
                {activities.map(
                  (activity) => (
                    <ActivityCard
                      key={
                        activity.messageId
                      }
                      activity={
                        activity
                      }
                    />
                  ),
                )}
              </div>
            )}
        </section>
      </main>
    </div>
  )
}

function normalizeActivity(item) {
  let events = []

  if (
    Array.isArray(item.activity)
  ) {
    events = item.activity
  } else if (
    item.activity &&
    typeof item.activity ===
      'object'
  ) {
    const old =
      item.activity

    if (old.intent_detected) {
      events.push({
        step: 'analysis',
        name: 'Intent detected',
        status: 'success',
      })
    }

    if (
      Array.isArray(
        old.tools_used,
      )
    ) {
      old.tools_used.forEach(
        (tool) => {
          events.push({
            step: 'tool_execution',
            name: tool,
            status: 'success',
          })
        },
      )
    }

    if (old.escalation_checked) {
      events.push({
        step: 'escalation',
        name: 'evaluate_escalation',
        status: 'success',
      })
    }

    if (old.escalated) {
      events.push({
        step: 'escalation',
        name: 'escalate_to_human',
        status: 'success',
        details: {
          priority:
            old.escalation_priority ||
            'medium',
        },
      })
    }

    if (old.confidence_evaluated) {
      events.push({
        step: 'analysis',
        name: 'evaluate_confidence',
        status: 'success',
      })
    }

    if (old.ticket_created) {
      events.push({
        step: 'escalation',
        name: 'ticket_created',
        status: 'success',
      })
    }

    if (old.response_generated) {
      events.push({
        step: 'response',
        name: 'generate_agent_response',
        status: 'success',
      })
    }
  }

  return {
    conversationId:
      item.conversation_id,

    messageId:
      item.message_id,

    response:
      item.response || '',

    intent:
      item.intent || null,

    confidence:
      item.confidence ?? null,

    requiresEscalation:
      item.requires_escalation ??
      false,

    ticketId:
      item.ticket_id || null,

    timestamp:
      item.timestamp,

    toolsUsed:
      Array.isArray(
        item.tools_used,
      )
        ? item.tools_used
        : extractTools(events),

    activity: events,
  }
}

function extractTools(events) {
  return events
    .filter(
      (event) =>
        event.step ===
        'tool_execution',
    )
    .map(
      (event) =>
        event.name,
    )
}

function Metric({
  icon,
  title,
  value,
  description,
  iconClass = 'text-blue-500',
}) {
  return (
    <div className="fc-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-[var(--text)]">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-[var(--muted)]">
            {description}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)] ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function ActivityCard({
  activity,
}) {
  return (
    <div className="fc-card overflow-hidden">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Bot size={15} />
            </div>

            <span className="text-xs font-bold text-[var(--text)]">
              AI Support Run
            </span>

            {activity.intent && (
              <span className="rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                {formatIntent(
                  activity.intent,
                )}
              </span>
            )}
          </div>

          <span className="text-[10px] text-[var(--muted)]">
            {formatDate(
              activity.timestamp,
            )}
          </span>
        </div>
      </div>

      <div className="p-5">
        {activity.activity.length >
          0 && (
          <div className="mb-6">
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Agent Operations
            </p>

            <div className="space-y-2">
              {activity.activity.map(
                (
                  event,
                  index,
                ) => (
                  <ActivityEvent
                    key={`${activity.messageId}-${index}`}
                    event={event}
                  />
                ),
              )}
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            Tools Used
          </p>

          {activity.toolsUsed.length >
          0 ? (
            <div className="flex flex-wrap gap-2">
              {activity.toolsUsed.map(
                (tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-[10px] font-semibold text-[var(--text-soft)]"
                  >
                    <Wrench
                      size={11}
                    />
                    {formatToolName(
                      tool,
                    )}
                  </span>
                ),
              )}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)]">
              No tools recorded
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoBox
            label="Confidence"
            value={formatConfidence(
              activity.confidence,
            )}
          />

          <InfoBox
            label="Conversation"
            value={
              activity.conversationId ||
              '—'
            }
          />

          <InfoBox
            label="Ticket"
            value={
              activity.ticketId ||
              '—'
            }
          />

          <InfoBox
            label="Escalation"
            value={
              activity.requiresEscalation
                ? 'Human Support'
                : 'Not Required'
            }
          />
        </div>

        {activity.requiresEscalation && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={17}
                className="text-amber-500"
              />

              <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Human support required
                </p>

                {activity.ticketId && (
                  <p className="mt-1 text-[10px] text-amber-600/70 dark:text-amber-400/70">
                    Ticket created:{' '}
                    <Link
                      to={`/tickets/${activity.ticketId}`}
                      className="font-bold underline"
                    >
                      {
                        activity.ticketId
                      }
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityEvent({
  event,
}) {
  const failed =
    event.status === 'failed'

  const running =
    event.status === 'running'

  const Icon = failed
    ? XCircle
    : running
      ? Clock3
      : CheckCircle2

  const iconClass = failed
    ? 'border-red-500/20 bg-red-500/5 text-red-500'
    : running
      ? 'border-amber-500/20 bg-amber-500/5 text-amber-500'
      : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${iconClass}`}
      >
        <Icon size={13} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[var(--text-soft)]">
          {formatActivityName(
            event.name,
          )}
        </p>

        <p className="text-[10px] text-[var(--muted)]">
          {formatStep(event.step)}

          {event.details?.priority && (
            <>
              {' • '}
              Priority:{' '}
              {event.details.priority}
            </>
          )}

          {event.details?.ticket_id && (
            <>
              {' • '}
              Ticket:{' '}
              {event.details.ticket_id}
            </>
          )}
        </p>
      </div>

      <span
        className={`text-[9px] font-bold ${
          failed
            ? 'text-red-500'
            : running
              ? 'text-amber-500'
              : 'text-emerald-500'
        }`}
      >
        {formatStatus(
          event.status,
        )}
      </span>
    </div>
  )
}

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-[var(--text-soft)]">
        {value}
      </p>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '-'

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value)
  }

  return date.toLocaleString()
}

function formatConfidence(
  confidence,
) {
  if (
    confidence === null ||
    confidence === undefined
  ) {
    return 'N/A'
  }

  return `${Math.round(
    Number(confidence) * 100,
  )}%`
}

function formatIntent(intent) {
  if (!intent) return 'Unknown'

  return String(intent)
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase(),
    )
}

function formatToolName(tool) {
  if (!tool) return 'Unknown tool'

  return String(tool)
    .replace(/^lookup_/, '')
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase(),
    )
}

function formatActivityName(
  name,
) {
  if (!name) return 'Agent operation'

  return String(name)
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase(),
    )
}

function formatStep(step) {
  if (!step) return 'Operation'

  return String(step)
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase(),
    )
}

function formatStatus(status) {
  if (!status) return 'Unknown'

  return String(status)
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase(),
    )
}

export default AgentActivity