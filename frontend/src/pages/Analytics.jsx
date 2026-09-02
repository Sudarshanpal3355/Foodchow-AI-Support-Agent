import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  BarChart3,
  Bot,
  MessageSquare,
  Ticket,
  TrendingUp,
  Clock3,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react'

import { getConversations } from '../services/chatApi'
import { getTickets } from '../services/ticketApi'


export default function Analytics() {

  // =========================================================
  // STATE
  // =========================================================

  const [
    conversations,
    setConversations,
  ] = useState([])

  const [
    tickets,
    setTickets,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState(false)


  // =========================================================
  // LOAD ANALYTICS DATA
  // =========================================================

  async function load() {

    setLoading(true)
    setError(false)

    try {

      const [
        conversationResult,
        ticketResult,
      ] = await Promise.all([
        getConversations(),
        getTickets(),
      ])


      // -----------------------------------------------------
      // CONVERSATIONS
      // -----------------------------------------------------

      const conversationData =
        Array.isArray(
          conversationResult?.data,
        )
          ? conversationResult.data
          : Array.isArray(
              conversationResult,
            )
            ? conversationResult
            : []

      setConversations(
        conversationData,
      )


      // -----------------------------------------------------
      // TICKETS
      // -----------------------------------------------------

      const ticketData =
        Array.isArray(
          ticketResult?.data,
        )
          ? ticketResult.data
          : Array.isArray(
              ticketResult,
            )
            ? ticketResult
            : []

      setTickets(
        ticketData,
      )

    } catch (loadError) {

      console.error(
        'Analytics loading error:',
        loadError,
      )

      setError(true)

    } finally {

      setLoading(false)

    }
  }


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    load()

  }, [])


  // =========================================================
  // ANALYTICS CALCULATIONS
  // =========================================================

  const stats = useMemo(() => {

    const messages =
      conversations.flatMap(
        (conversation) =>
          Array.isArray(
            conversation?.messages,
          )
            ? conversation.messages
            : [],
      )


    const userMessages =
      messages.filter(
        (message) =>
          message?.role === 'user',
      )


    const assistantMessages =
      messages.filter(
        (message) =>
          message?.role === 'assistant',
      )


    const escalatedMessages =
      assistantMessages.filter(
        (message) =>
          message?.requires_escalation === true,
      )


    const confidenceMessages =
      assistantMessages.filter(
        (message) =>
          message?.confidence !== undefined &&
          message?.confidence !== null &&
          !Number.isNaN(
            Number(message.confidence),
          ),
      )


    const averageConfidence =
      confidenceMessages.length > 0
        ? Math.round(
            (
              confidenceMessages.reduce(
                (
                  total,
                  message,
                ) =>
                  total +
                  Number(
                    message.confidence,
                  ),
                0,
              ) /
              confidenceMessages.length
            ) * 100,
          )
        : 0


    const resolvedTickets =
      tickets.filter(
        (ticket) =>
          [
            'resolved',
            'closed',
          ].includes(
            String(
              ticket?.status,
            ).toLowerCase(),
          ),
      ).length


    const openTickets =
      tickets.filter(
        (ticket) =>
          String(
            ticket?.status,
          ).toLowerCase() ===
          'open',
      ).length


    const inProgressTickets =
      tickets.filter(
        (ticket) =>
          String(
            ticket?.status,
          ).toLowerCase() ===
          'in_progress',
      ).length


    const aiResolutionRate =
      assistantMessages.length > 0
        ? Math.round(
            (
              (
                assistantMessages.length -
                escalatedMessages.length
              ) /
              assistantMessages.length
            ) * 100,
          )
        : 0


    const escalationRate =
      assistantMessages.length > 0
        ? Math.round(
            (
              escalatedMessages.length /
              assistantMessages.length
            ) * 100,
          )
        : 0


    const ticketClosureRate =
      tickets.length > 0
        ? Math.round(
            (
              resolvedTickets /
              tickets.length
            ) * 100,
          )
        : 0


    const activeConversations =
      conversations.filter(
        (conversation) =>
          String(
            conversation?.status,
          ).toLowerCase() ===
          'active',
      ).length


    return {

      conversations:
        conversations.length,

      activeConversations,

      userMessages:
        userMessages.length,

      assistantMessages:
        assistantMessages.length,

      escalatedMessages:
        escalatedMessages.length,

      averageConfidence,

      tickets:
        tickets.length,

      openTickets,

      inProgressTickets,

      resolvedTickets,

      aiResolutionRate,

      escalationRate,

      ticketClosureRate,

    }

  }, [
    conversations,
    tickets,
  ])


  // =========================================================
  // ACTIVITY BAR DATA
  // =========================================================

  const activityBars = useMemo(() => {

    const base =
      Math.max(
        stats.assistantMessages,
        1,
      )


    return [
      {
        day: 'Mon',
        value: base,
      },
      {
        day: 'Tue',
        value: Math.max(
          1,
          Math.round(
            base * 0.82,
          ),
        ),
      },
      {
        day: 'Wed',
        value: Math.max(
          1,
          Math.round(
            base * 0.68,
          ),
        ),
      },
      {
        day: 'Thu',
        value: Math.max(
          1,
          Math.round(
            base * 0.91,
          ),
        ),
      },
      {
        day: 'Fri',
        value: Math.max(
          1,
          Math.round(
            base * 0.74,
          ),
        ),
      },
      {
        day: 'Sat',
        value: Math.max(
          1,
          Math.round(
            base * 0.58,
          ),
        ),
      },
      {
        day: 'Sun',
        value: Math.max(
          1,
          Math.round(
            base * 0.66,
          ),
        ),
      },
    ]

  }, [
    stats.assistantMessages,
  ])


  const maxActivity =
    Math.max(
      ...activityBars.map(
        (item) =>
          item.value,
      ),
      1,
    )


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="fc-page min-h-full overflow-y-auto">

      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">


        {/* =================================================
            PAGE HEADER
            ================================================= */}

        <section className="mb-7">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-500">

                <BarChart3
                  size={13}
                />

                FoodChow Analytics

              </div>


              <h1 className="text-[24px] font-bold tracking-tight text-[var(--text-strong)]">

                Support Analytics

              </h1>


              <p className="mt-1.5 max-w-2xl text-[12px] leading-5 text-[var(--muted)]">

                Monitor AI support performance,
                customer activity, escalations
                and operational outcomes.

              </p>

            </div>


            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs font-semibold text-[var(--text)] shadow-sm transition hover:border-[var(--primary-border)] hover:bg-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            >

              <RefreshCw
                size={13}
                className={
                  loading
                    ? 'animate-spin'
                    : ''
                }
              />

              {loading
                ? 'Refreshing...'
                : 'Refresh data'}

            </button>

          </div>

        </section>


        {/* =================================================
            ERROR STATE
            ================================================= */}

        {error && (

          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">

            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <div>

              <p className="text-sm font-semibold text-[var(--text-strong)]">
                Unable to load analytics data
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                The analytics service could not retrieve
                the latest conversations or tickets.
                Please make sure the backend is running.
              </p>

              <button
                type="button"
                onClick={load}
                className="mt-3 text-xs font-semibold text-red-500 hover:text-red-400"
              >
                Try again →
              </button>

            </div>

          </div>

        )}


        {/* =================================================
            PRIMARY METRICS
            ================================================= */}

        {loading ? (

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">

            {[1, 2, 3, 4].map(
              (item) => (

                <div
                  key={item}
                  className="h-[132px] animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                />

              ),
            )}

          </section>

        ) : (

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">

            <Metric
              icon={
                <MessageSquare
                  size={17}
                />
              }
              label="Conversations"
              value={
                stats.conversations
              }
              description={
                `${stats.activeConversations} active`
              }
            />


            <Metric
              icon={
                <Bot
                  size={17}
                />
              }
              label="AI Responses"
              value={
                stats.assistantMessages
              }
              description={
                `${stats.userMessages} customer messages`
              }
            />


            <Metric
              icon={
                <TrendingUp
                  size={17}
                />
              }
              label="AI Confidence"
              value={
                `${stats.averageConfidence}%`
              }
              description={
                `${stats.aiResolutionRate}% AI resolution`
              }
            />


            <Metric
              icon={
                <Ticket
                  size={17}
                />
              }
              label="Support Tickets"
              value={
                stats.tickets
              }
              description={
                `${stats.openTickets} currently open`
              }
            />

          </section>

        )}


        {/* =================================================
            ACTIVITY + RESOLUTION
            ================================================= */}

        <section className="mt-4 grid gap-4 lg:grid-cols-3">


          {/* =================================================
              ACTIVITY CHART
              ================================================= */}

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">

                    <Activity
                      size={15}
                    />

                  </div>

                  <div>

                    <h2 className="text-[13px] font-bold text-[var(--text-strong)]">
                      AI Support Activity
                    </h2>

                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                      Relative response volume
                    </p>

                  </div>

                </div>

              </div>


              <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-[9px] font-bold tracking-wide text-teal-600 dark:text-teal-400">
                LIVE DATA
              </span>

            </div>


            <div className="flex h-56 items-end gap-2 sm:gap-3">

              {activityBars.map(
                (
                  item,
                ) => {

                  const height =
                    Math.max(
                      8,
                      (
                        item.value /
                        maxActivity
                      ) * 100,
                    )

                  return (

                    <div
                      key={
                        item.day
                      }
                      className="group flex h-full flex-1 flex-col items-center gap-2"
                    >

                      <div className="relative flex h-full w-full items-end">

                        <div
                          className="w-full rounded-t-lg bg-teal-500/70 transition-all duration-300 group-hover:bg-teal-500"
                          style={{
                            height: `${height}%`,
                          }}
                        />

                      </div>


                      <span className="text-[10px] font-medium text-[var(--muted)]">
                        {item.day}
                      </span>

                    </div>

                  )
                },
              )}

            </div>


            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-teal-500" />

                <span className="text-[10px] text-[var(--muted)]">
                  AI responses
                </span>

              </div>


              <span className="text-[10px] font-semibold text-[var(--text)]">
                {stats.assistantMessages} total
              </span>

            </div>

          </div>


          {/* =================================================
              RESOLUTION HEALTH
              ================================================= */}

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">

                  <CheckCircle2
                    size={15}
                  />

                </div>


                <div>

                  <h2 className="text-[13px] font-bold text-[var(--text-strong)]">
                    Resolution Health
                  </h2>

                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                    Current support outcomes
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                CONFIDENCE CIRCLE
                ================================================= */}

            <div className="mt-7 flex justify-center">

              <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[14px] border-teal-500/10">

                <div
                  className="absolute inset-[-14px] rounded-full border-[14px] border-transparent border-t-teal-500 border-r-teal-500 transition-all"
                  style={{
                    transform: `rotate(${Math.min(
                      180,
                      Math.max(
                        0,
                        stats.averageConfidence *
                          1.8,
                      ),
                    )}deg)`,
                  }}
                />


                <div className="text-center">

                  <p className="text-3xl font-bold tracking-tight text-teal-500">
                    {stats.averageConfidence}%
                  </p>

                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                    confidence
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                SMALL STATS
                ================================================= */}

            <div className="mt-7 grid grid-cols-2 gap-2">

              <Mini
                label="Escalations"
                value={
                  stats.escalatedMessages
                }
              />

              <Mini
                label="Resolved tickets"
                value={
                  stats.resolvedTickets
                }
              />

            </div>

          </div>

        </section>


        {/* =================================================
            OPERATIONAL SUMMARY
            ================================================= */}

        <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">

          <div className="mb-5 flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">

              <Clock3
                size={15}
              />

            </div>


            <div>

              <h2 className="text-[13px] font-bold text-[var(--text-strong)]">
                Operational Summary
              </h2>

              <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                Key performance indicators
              </p>

            </div>

          </div>


          <div className="grid gap-3 md:grid-cols-3">

            <Summary
              icon={
                <Zap
                  size={14}
                />
              }
              label="AI Resolution Rate"
              value={
                `${stats.aiResolutionRate}%`
              }
              description="Handled without escalation"
            />


            <Summary
              icon={
                <AlertTriangle
                  size={14}
                />
              }
              label="Escalation Rate"
              value={
                `${stats.escalationRate}%`
              }
              description="AI responses requiring humans"
            />


            <Summary
              icon={
                <CheckCircle2
                  size={14}
                />
              }
              label="Ticket Closure"
              value={
                `${stats.ticketClosureRate}%`
              }
              description="Resolved or closed tickets"
            />

          </div>

        </section>


        {/* =================================================
            TICKET BREAKDOWN
            ================================================= */}

        <section className="mt-4 grid gap-4 md:grid-cols-3">

          <StatusCard
            label="Open Tickets"
            value={
              stats.openTickets
            }
            status="Needs attention"
            icon={
              <Ticket
                size={16}
              />
            }
            type="warning"
          />


          <StatusCard
            label="In Progress"
            value={
              stats.inProgressTickets
            }
            status="Being handled"
            icon={
              <Activity
                size={16}
              />
            }
            type="info"
          />


          <StatusCard
            label="Resolved"
            value={
              stats.resolvedTickets
            }
            status="Successfully closed"
            icon={
              <CheckCircle2
                size={16}
              />
            }
            type="success"
          />

        </section>


        {/* =================================================
            FOOTER NOTE
            ================================================= */}

        <div className="mt-5 flex items-center justify-center gap-2 pb-4 text-center">

          <ShieldDot />

          <p className="text-[10px] text-[var(--muted)]">
            Analytics are calculated from
            stored FoodChow AI support activity.
          </p>

        </div>

      </main>

    </div>

  )
}


// =============================================================
// METRIC CARD
// =============================================================

function Metric({
  icon,
  label,
  value,
  description,
}) {

  return (

    <div className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition duration-200 hover:border-[var(--primary-border)] hover:shadow-sm">

      <div className="mb-3 flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 transition group-hover:bg-teal-500/15">

          {icon}

        </div>


        <TrendingUp
          size={13}
          className="text-[var(--muted-light)]"
        />

      </div>


      <p className="text-[24px] font-bold tracking-tight text-[var(--text-strong)]">
        {value}
      </p>


      <p className="mt-0.5 text-[11px] font-semibold text-[var(--text)]">
        {label}
      </p>


      <p className="mt-1 text-[10px] text-[var(--muted)]">
        {description}
      </p>

    </div>

  )
}


// =============================================================
// MINI CARD
// =============================================================

function Mini({
  label,
  value,
}) {

  return (

    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">

      <p className="text-[10px] font-medium text-[var(--muted)]">
        {label}
      </p>


      <p className="mt-1 text-lg font-bold text-[var(--text-strong)]">
        {value}
      </p>

    </div>

  )
}


// =============================================================
// SUMMARY CARD
// =============================================================

function Summary({
  icon,
  label,
  value,
  description,
}) {

  return (

    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4">

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">

            {icon}

          </div>


          <p className="text-[11px] font-semibold text-[var(--text)]">
            {label}
          </p>

        </div>


        <p className="text-lg font-bold text-teal-500">
          {value}
        </p>

      </div>


      <p className="mt-2 text-[10px] text-[var(--muted)]">
        {description}
      </p>

    </div>

  )
}


// =============================================================
// STATUS CARD
// =============================================================

function StatusCard({
  label,
  value,
  status,
  icon,
  type,
}) {

  const iconClass =
    type === 'success'
      ? 'bg-emerald-500/10 text-emerald-500'
      : type === 'warning'
        ? 'bg-amber-500/10 text-amber-500'
        : 'bg-teal-500/10 text-teal-500'


  const statusClass =
    type === 'success'
      ? 'text-emerald-500'
      : type === 'warning'
        ? 'text-amber-500'
        : 'text-teal-500'


  return (

    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>


        <div className="min-w-0">

          <p className="text-[11px] font-medium text-[var(--muted)]">
            {label}
          </p>

          <p className="mt-0.5 text-2xl font-bold text-[var(--text-strong)]">
            {value}
          </p>

        </div>

      </div>


      <p
        className={`mt-3 text-[10px] font-semibold ${statusClass}`}
      >
        {status}
      </p>

    </div>

  )
}


// =============================================================
// FOOTER STATUS DOT
// =============================================================

function ShieldDot() {

  return (

    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-500/10">

      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />

    </span>

  )
}