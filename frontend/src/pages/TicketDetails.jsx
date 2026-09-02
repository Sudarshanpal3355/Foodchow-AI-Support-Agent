import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  ShieldCheck,
  Ticket as TicketIcon,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  getTicket,
  updateTicket,
} from '../services/ticketApi'

function TicketDetails() {
  const { ticketId } =
    useParams()

  const [ticket, setTicket] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [updating, setUpdating] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchTicket() {
      if (!ticketId) {
        setLoading(false)
        setError(
          'Ticket ID is missing.',
        )
        return
      }

      try {
        setLoading(true)
        setError('')
        setSuccess('')

        const result =
          await getTicket(ticketId)

        if (cancelled) return

        if (
          !result ||
          !result.success
        ) {
          throw new Error(
            result?.message ||
              'Unable to load ticket.',
          )
        }

        setTicket(result.data)
      } catch (err) {
        if (cancelled) return

        console.error(
          'Ticket loading error:',
          err,
        )

        setError(
          err.response?.data
            ?.detail ||
            err.message ||
            'Unable to load ticket.',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTicket()

    return () => {
      cancelled = true
    }
  }, [ticketId])

  async function handleStatusUpdate(
    newStatus,
  ) {
    if (
      !ticket ||
      updating ||
      ticket.status === newStatus
    ) {
      return
    }

    try {
      setUpdating(true)
      setError('')
      setSuccess('')

      const result =
        await updateTicket(
          ticket.ticket_id,
          {
            status: newStatus,
          },
        )

      if (
        !result ||
        !result.success
      ) {
        throw new Error(
          result?.message ||
            'Unable to update ticket.',
        )
      }

      setTicket(result.data)

      setSuccess(
        `Ticket status changed to ${formatStatus(
          newStatus,
        )}.`,
      )
    } catch (err) {
      console.error(
        'Ticket update error:',
        err,
      )

      setError(
        err.response?.data?.detail ||
          err.message ||
          'Unable to update ticket.',
      )
    } finally {
      setUpdating(false)
    }
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

  function priorityClass(priority) {
    switch (
      priority?.toLowerCase()
    ) {
      case 'high':
        return 'border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400'

      case 'medium':
        return 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400'

      case 'low':
        return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'

      default:
        return 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]'
    }
  }

  function statusClass(status) {
    switch (
      status?.toLowerCase()
    ) {
      case 'open':
        return 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400'

      case 'in_progress':
        return 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400'

      case 'resolved':
        return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'

      case 'closed':
        return 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]'

      default:
        return 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]'
    }
  }

  if (loading) {
    return (
      <div className="fc-page flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 shadow-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500" />

          <p className="text-xs text-[var(--muted)]">
            Loading support ticket...
          </p>
        </div>
      </div>
    )
  }

  if (error && !ticket) {
    return (
      <div className="fc-page px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-500"
              />

              <div>
                <h1 className="font-bold text-red-600 dark:text-red-400">
                  Unable to load ticket
                </h1>

                <p className="mt-2 text-sm leading-6 text-red-600/70 dark:text-red-400/70">
                  {error}
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/tickets"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--text-soft)]"
          >
            <ArrowLeft size={14} />
            Back to Tickets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fc-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">
                <Link
                  to="/tickets"
                  className="text-blue-600 dark:text-blue-400"
                >
                  Support Tickets
                </Link>

                <span className="text-[var(--muted-soft)]">
                  /
                </span>

                <span className="text-[var(--muted)]">
                  Case Details
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-mono text-xl font-bold text-[var(--text)]">
                  {ticket.ticket_id}
                </h1>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClass(
                    ticket.status,
                  )}`}
                >
                  {formatStatus(
                    ticket.status,
                  )}
                </span>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${priorityClass(
                    ticket.priority,
                  )}`}
                >
                  {formatStatus(
                    ticket.priority ||
                      'medium',
                  )}{' '}
                  priority
                </span>
              </div>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Human support case created from
                an AI escalation.
              </p>
            </div>

            <Link
              to="/tickets"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--text-soft)] transition hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ArrowLeft size={14} />
              Back to Queue
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        {error && (
          <Notice
            type="error"
            message={error}
          />
        )}

        {success && (
          <Notice
            type="success"
            message={success}
          />
        )}

        {/* =====================================================
            AI HANDOFF
        ===================================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-blue-500/15 bg-blue-500/5">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Bot size={18} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                  Human Handoff
                </p>

                <h2 className="mt-1 text-sm font-bold text-[var(--text)]">
                  AI agent escalated this case
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--muted)]">
                  Review the verified ticket
                  context and update the case as
                  support progresses.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {formatStatus(
                ticket.status,
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* ISSUE */}
            <section className="fc-card overflow-hidden">
              <SectionHeader
                icon={
                  <TicketIcon size={16} />
                }
                eyebrow="Customer Issue"
                title="Issue Description"
              />

              <div className="p-5">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-soft)]">
                    {ticket.issue ||
                      'No issue description available.'}
                  </p>
                </div>
              </div>
            </section>

            {/* STATUS */}
            <section className="fc-card overflow-hidden">
              <SectionHeader
                icon={
                  <Clock3 size={16} />
                }
                eyebrow="Case Workflow"
                title="Update Support Status"
                description="Move the case through the human-support lifecycle."
              />

              <div className="grid gap-3 p-5 sm:grid-cols-2">
                <StatusAction
                  label="Open"
                  description="Awaiting support action"
                  active={
                    ticket.status ===
                    'open'
                  }
                  disabled={updating}
                  onClick={() =>
                    handleStatusUpdate(
                      'open',
                    )
                  }
                  tone="blue"
                />

                <StatusAction
                  label="In Progress"
                  description="Support team is investigating"
                  active={
                    ticket.status ===
                    'in_progress'
                  }
                  disabled={updating}
                  onClick={() =>
                    handleStatusUpdate(
                      'in_progress',
                    )
                  }
                  tone="amber"
                />

                <StatusAction
                  label="Resolved"
                  description="Issue has been resolved"
                  active={
                    ticket.status ===
                    'resolved'
                  }
                  disabled={updating}
                  onClick={() =>
                    handleStatusUpdate(
                      'resolved',
                    )
                  }
                  tone="green"
                />

                <StatusAction
                  label="Closed"
                  description="Case lifecycle completed"
                  active={
                    ticket.status ===
                    'closed'
                  }
                  disabled={updating}
                  onClick={() =>
                    handleStatusUpdate(
                      'closed',
                    )
                  }
                  tone="slate"
                />
              </div>

              {updating && (
                <div className="flex items-center gap-2 px-5 pb-5 text-[10px] text-[var(--muted)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  Saving ticket status...
                </div>
              )}
            </section>

            {/* TIMELINE */}
            <section className="fc-card overflow-hidden">
              <SectionHeader
                icon={
                  <Clock3 size={16} />
                }
                eyebrow="Case Timeline"
                title="Ticket Activity"
              />

              <div className="p-5">
                <TimelineItem
                  title="Ticket created"
                  description="The support case entered the human-support queue."
                  date={formatDate(
                    ticket.created_at,
                  )}
                  active
                />

                <TimelineItem
                  title="Current status"
                  description={`Ticket is currently ${formatStatus(
                    ticket.status,
                  ).toLowerCase()}.`}
                  date={formatDate(
                    ticket.updated_at,
                  )}
                  active={
                    ticket.status !==
                    'closed'
                  }
                />
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="space-y-5">
            <SideCard title="Case Summary">
              <SummaryRow
                label="Ticket"
                value={
                  ticket.ticket_id
                }
                mono
              />

              <SummaryRow
                label="Status"
                value={formatStatus(
                  ticket.status,
                )}
              />

              <SummaryRow
                label="Priority"
                value={formatStatus(
                  ticket.priority ||
                    'medium',
                )}
              />
            </SideCard>

            <SideCard title="Customer Context">
              <SummaryRow
                label="Customer ID"
                value={
                  ticket.customer_id ||
                  'Not available'
                }
                mono={
                  Boolean(
                    ticket.customer_id,
                  )
                }
              />

              <SummaryRow
                label="Order ID"
                value={
                  ticket.order_id ||
                  'Not linked'
                }
                mono={
                  Boolean(
                    ticket.order_id,
                  )
                }
              />

              <SummaryRow
                label="Restaurant"
                value={
                  ticket.restaurant_id ||
                  'Not available'
                }
                mono={
                  Boolean(
                    ticket.restaurant_id,
                  )
                }
              />

              <SummaryRow
                label="Outlet"
                value={
                  ticket.outlet_id ||
                  'Not available'
                }
                mono={
                  Boolean(
                    ticket.outlet_id,
                  )
                }
              />
            </SideCard>

            <SideCard title="Timestamps">
              <DateRow
                label="Created"
                value={formatDate(
                  ticket.created_at,
                )}
              />

              <DateRow
                label="Last Updated"
                value={formatDate(
                  ticket.updated_at,
                )}
              />
            </SideCard>

            <SideCard title="Support Actions">
              {ticket.order_id && (
                <Link
                  to="/chat"
                  className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs font-bold text-blue-600 transition hover:bg-blue-500/10 dark:text-blue-400"
                >
                  <span className="flex items-center gap-2">
                    <Bot size={14} />
                    Investigate with AI
                  </span>

                  <ExternalLink
                    size={13}
                  />
                </Link>
              )}

              <Link
                to="/tickets"
                className="mt-2 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-xs font-bold text-[var(--text-soft)]"
              >
                Return to queue
                <ArrowLeft size={13} />
              </Link>
            </SideCard>
          </aside>
        </section>

        <div className="mt-7 flex items-center justify-between border-t border-[var(--border)] pt-5">
          <p className="text-[10px] text-[var(--muted)]">
            FoodChow AI Support · Human
            escalation workflow
          </p>

          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={12} />
            Verified workflow
          </div>
        </div>
      </main>
    </div>
  )
}

function Notice({
  type,
  message,
}) {
  const success =
    type === 'success'

  return (
    <div
      className={
        success
          ? 'mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3'
          : 'mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3'
      }
    >
      <div className="flex items-center gap-2">
        {success ? (
          <CheckCircle2
            size={15}
            className="text-emerald-500"
          />
        ) : (
          <AlertCircle
            size={15}
            className="text-red-500"
          />
        )}

        <p
          className={
            success
              ? 'text-xs font-semibold text-emerald-600 dark:text-emerald-400'
              : 'text-xs font-semibold text-red-600 dark:text-red-400'
          }
        >
          {message}
        </p>
      </div>
    </div>
  )
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="border-b border-[var(--border)] px-5 py-4">
      <div className="flex items-center gap-2 text-blue-500">
        {icon}

        <p className="text-[9px] font-bold uppercase tracking-[0.14em]">
          {eyebrow}
        </p>
      </div>

      <h2 className="mt-1.5 text-sm font-bold text-[var(--text)]">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-[10px] text-[var(--muted)]">
          {description}
        </p>
      )}
    </div>
  )
}

function StatusAction({
  label,
  description,
  active,
  disabled,
  onClick,
  tone,
}) {
  const tones = {
    blue: {
      dot: 'bg-blue-500',
      active:
        'border-blue-500/30 bg-blue-500/5',
      text: 'text-blue-600 dark:text-blue-400',
    },

    amber: {
      dot: 'bg-amber-500',
      active:
        'border-amber-500/30 bg-amber-500/5',
      text: 'text-amber-600 dark:text-amber-400',
    },

    green: {
      dot: 'bg-emerald-500',
      active:
        'border-emerald-500/30 bg-emerald-500/5',
      text: 'text-emerald-600 dark:text-emerald-400',
    },

    slate: {
      dot: 'bg-slate-400',
      active:
        'border-[var(--border-strong)] bg-[var(--surface-soft)]',
      text: 'text-[var(--text-soft)]',
    },
  }

  const style =
    tones[tone] ||
    tones.slate

  return (
    <button
      type="button"
      disabled={
        disabled || active
      }
      onClick={onClick}
      className={[
        'rounded-xl border p-4 text-left transition',
        active
          ? style.active
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-blue-500/20 hover:bg-[var(--surface-soft)]',
        'disabled:cursor-not-allowed',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`}
        />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`text-xs font-bold ${
                active
                  ? style.text
                  : 'text-[var(--text-soft)]'
              }`}
            >
              {label}
            </p>

            {active && (
              <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[8px] font-bold text-[var(--muted)]">
                Current
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] leading-5 text-[var(--muted)]">
            {description}
          </p>
        </div>
      </div>
    </button>
  )
}

function TimelineItem({
  title,
  description,
  date,
  active,
}) {
  return (
    <div className="relative flex gap-3.5">
      <div className="flex flex-col items-center">
        <span
          className={`mt-1 h-2.5 w-2.5 rounded-full ${
            active
              ? 'bg-blue-500'
              : 'bg-[var(--border-strong)]'
          }`}
        />

        <span className="mt-1 h-full w-px bg-[var(--border)]" />
      </div>

      <div className="pb-6">
        <p className="text-xs font-bold text-[var(--text-soft)]">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-5 text-[var(--muted)]">
          {description}
        </p>

        <p className="mt-2 text-[9px] text-[var(--muted-soft)]">
          {date}
        </p>
      </div>
    </div>
  )
}

function SideCard({
  title,
  children,
}) {
  return (
    <section className="fc-card overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3.5">
        <h2 className="text-xs font-bold text-[var(--text)]">
          {title}
        </h2>
      </div>

      <div className="space-y-1 p-3">
        {children}
      </div>
    </section>
  )
}

function SummaryRow({
  label,
  value,
  mono = false,
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg px-2 py-2.5 transition hover:bg-[var(--surface-soft)]">
      <span className="text-[10px] text-[var(--muted)]">
        {label}
      </span>

      <span
        className={`max-w-[180px] truncate text-right text-[10px] font-semibold text-[var(--text-soft)] ${
          mono ? 'font-mono' : ''
        }`}
        title={String(value)}
      >
        {value}
      </span>
    </div>
  )
}

function DateRow({
  label,
  value,
}) {
  return (
    <div className="px-2 py-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted-soft)]">
        {label}
      </p>

      <p className="mt-1 text-[10px] text-[var(--text-soft)]">
        {value}
      </p>
    </div>
  )
}

export default TicketDetails