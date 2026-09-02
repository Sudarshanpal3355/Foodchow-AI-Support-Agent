import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import { getAgentStatus } from '../services/agentApi'
import { getTickets } from '../services/ticketApi'
import { getConversations } from '../services/chatApi'

import foodchowLogo from '../assets/foodchow-logo.png'


function Dashboard() {
  const [agentStatus, setAgentStatus] = useState(null)
  const [tickets, setTickets] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [backendError, setBackendError] = useState(false)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)

      let hasBackendError = false

      try {
        const agentData = await getAgentStatus()
        setAgentStatus(agentData)
      } catch (error) {
        console.error('Agent status error:', error)
        hasBackendError = true
      }

      try {
        const ticketResult = await getTickets()

        if (ticketResult?.success) {
          setTickets(ticketResult.data || [])
        } else {
          hasBackendError = true
        }
      } catch (error) {
        console.error('Ticket loading error:', error)
        hasBackendError = true
      }

      try {
        const conversationResult = await getConversations()

        if (conversationResult?.success) {
          setConversations(conversationResult.data || [])
        } else {
          hasBackendError = true
        }
      } catch (error) {
        console.error('Conversation loading error:', error)
        hasBackendError = true
      }

      setBackendError(hasBackendError)
      setLoading(false)
    }

    loadDashboardData()
  }, [])


  // =========================================================
  // METRICS
  // =========================================================

  const metrics = useMemo(() => {
    const totalConversations = conversations.length

    const activeConversations = conversations.filter(
      (conversation) =>
        conversation.status === 'active'
    ).length

    const totalTickets = tickets.length

    const openTickets = tickets.filter(
      (ticket) =>
        ticket.status === 'open'
    ).length

    const inProgressTickets = tickets.filter(
      (ticket) =>
        ticket.status === 'in_progress'
    ).length

    const resolvedTickets = tickets.filter(
      (ticket) =>
        ticket.status === 'resolved'
    ).length

    const assistantMessages = conversations.flatMap(
      (conversation) =>
        (conversation.messages || []).filter(
          (message) =>
            message.role === 'assistant'
        )
    )

    const metadataMessages = assistantMessages.filter(
      (message) =>
        message.confidence !== undefined &&
        message.confidence !== null
    )

    const averageConfidence =
      metadataMessages.length > 0
        ? Math.round(
            (
              metadataMessages.reduce(
                (total, message) =>
                  total + Number(message.confidence),
                0
              ) /
              metadataMessages.length
            ) * 100
          )
        : 0

    const escalatedMessages = assistantMessages.filter(
      (message) =>
        message.requires_escalation === true
    ).length

    const aiResolutionRate =
      assistantMessages.length > 0
        ? Math.round(
            (
              (
                assistantMessages.length -
                escalatedMessages
              ) /
              assistantMessages.length
            ) * 100
          )
        : 0

    return {
      totalConversations,
      activeConversations,
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      assistantMessages,
      metadataMessages,
      averageConfidence,
      escalatedMessages,
      aiResolutionRate,
    }
  }, [conversations, tickets])


  // =========================================================
  // RECENT DATA
  // =========================================================

  const recentConversations = useMemo(
    () =>
      [...conversations]
        .sort(
          (a, b) =>
            new Date(b.updated_at || 0) -
            new Date(a.updated_at || 0)
        )
        .slice(0, 5),
    [conversations]
  )


  const recentTickets = useMemo(
    () =>
      [...tickets]
        .sort(
          (a, b) =>
            new Date(
              b.created_at ||
              b.updated_at ||
              0
            ) -
            new Date(
              a.created_at ||
              a.updated_at ||
              0
            )
        )
        .slice(0, 5),
    [tickets]
  )


  // =========================================================
  // HELPERS
  // =========================================================

  function formatDate(value) {
    if (!value) {
      return '-'
    }

    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }


  function getAgentEngineStatus() {
    if (backendError) {
      return 'Offline'
    }

    if (agentStatus) {
      return 'Connected'
    }

    return 'Checking'
  }


  function getTicketStatusClass(status) {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'

      case 'in_progress':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'

      case 'open':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20'

      default:
        return 'bg-slate-800 text-slate-400 border-slate-700'
    }
  }


  function formatStatus(status) {
    if (!status) {
      return 'Open'
    }

    return status
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          {/* =================================================
              FOODCHOW BRANDING
              ================================================= */}

          <div className="flex items-center gap-4">

            {/* Full FoodChow Logo */}

            <div className="flex h-12 items-center rounded-xl bg-white px-3 shadow-sm ring-1 ring-slate-200">

              <img
                src={foodchowLogo}
                alt="FoodChow"
                className="h-9 w-auto object-contain"
              />

            </div>


            {/* Dashboard Title */}

            <div>

              <h1 className="text-xl font-semibold tracking-tight text-slate-100">
                AI Support Dashboard
              </h1>

              <p className="text-sm text-slate-400">
                Agentic customer support operations
              </p>

            </div>

          </div>


          {/* =================================================
              SYSTEM STATUS
              ================================================= */}

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-xs text-slate-500">
                System status
              </p>

              <p className="text-sm font-medium text-slate-200">
                {backendError
                  ? 'Backend unavailable'
                  : 'All systems operational'}
              </p>

            </div>


            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                backendError
                  ? 'border-red-500/20 bg-red-500/10'
                  : 'border-emerald-500/20 bg-emerald-500/10'
              }`}
            >

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  backendError
                    ? 'bg-red-400'
                    : 'bg-emerald-400'
                }`}
              />

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* ===================================================
            PAGE INTRO
        =================================================== */}

        <section className="mb-8">

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>

              <p className="mb-2 text-sm font-semibold tracking-wide text-teal-400">
                AI OPERATIONS
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-100">
                Support Overview
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Monitor customer conversations, AI responses,
                support tickets, escalations and agent activity
                from one place.
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <Link
                to="/chat"
                className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 hover:shadow-md"
              >
                Start AI Chat
              </Link>

              <Link
                to="/tickets"
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-500/40 hover:bg-slate-800"
              >
                View Tickets
              </Link>

            </div>

          </div>

        </section>


        {/* ===================================================
            PRIMARY METRICS
        =================================================== */}

        {loading ? (

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"
              />

            ))}

          </div>

        ) : (

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <MetricCard
              label="Active Conversations"
              value={metrics.activeConversations}
              helper={`${metrics.totalConversations} total conversations`}
              icon="◌"
            />

            <MetricCard
              label="AI Resolution Rate"
              value={`${metrics.aiResolutionRate}%`}
              helper={`${metrics.assistantMessages.length} AI responses`}
              icon="✓"
            />

            <MetricCard
              label="Open Tickets"
              value={metrics.openTickets}
              helper={`${metrics.totalTickets} total tickets`}
              icon="!"
            />

            <MetricCard
              label="AI Confidence"
              value={`${metrics.averageConfidence}%`}
              helper={`${metrics.metadataMessages.length} analyzed responses`}
              icon="◎"
            />

          </section>

        )}


        {/* ===================================================
            SECONDARY METRICS
        =================================================== */}

        <section className="mt-4 grid gap-4 md:grid-cols-3">

          <SecondaryMetric
            label="In Progress"
            value={metrics.inProgressTickets}
            description="Tickets currently being handled"
          />

          <SecondaryMetric
            label="Resolved"
            value={metrics.resolvedTickets}
            description="Successfully resolved tickets"
          />

          <SecondaryMetric
            label="Escalations"
            value={metrics.escalatedMessages}
            description="AI responses requiring human support"
          />

        </section>


        {/* ===================================================
            RECENT CONVERSATIONS + TICKETS
        =================================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* =================================================
              CONVERSATIONS
              ================================================= */}

          <DashboardPanel
            title="Recent Conversations"
            subtitle="Latest customer support interactions"
            actionText="View all"
            actionTo="/conversations"
          >

            {recentConversations.length === 0 ? (

              <EmptyState
                title="No conversations yet"
                description="Customer conversations will appear here."
                actionText="Open AI Chat"
                actionTo="/chat"
              />

            ) : (

              <div className="space-y-3">

                {recentConversations.map(
                  (conversation, index) => {

                    const firstUserMessage =
                      (
                        conversation.messages || []
                      ).find(
                        (message) =>
                          message.role === 'user'
                      )

                    const conversationId =
                      conversation.conversation_id ||
                      conversation.id ||
                      `conversation-${index}`

                    return (

                      <Link
                        key={conversationId}
                        to={`/chat?conversation=${encodeURIComponent(
                          conversationId
                        )}`}
                        className="group block rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-teal-500/40 hover:bg-slate-800/50"
                      >

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-sm font-semibold text-teal-400">
                            AI
                          </div>


                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-3">

                              <p className="truncate text-sm font-semibold text-slate-200">
                                {conversationId}
                              </p>

                              <span className="shrink-0 text-xs text-slate-500">
                                {formatDate(
                                  conversation.updated_at
                                )}
                              </span>

                            </div>


                            <p className="mt-1 truncate text-sm text-slate-400">
                              {firstUserMessage?.content ||
                                'No user message available'}
                            </p>


                            <div className="mt-3 flex items-center gap-2">

                              <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2 py-1 text-[11px] text-slate-400">
                                {formatStatus(
                                  conversation.status ||
                                    'active'
                                )}
                              </span>

                              <span className="text-xs text-teal-400 opacity-0 transition group-hover:opacity-100">
                                Open →
                              </span>

                            </div>

                          </div>

                        </div>

                      </Link>

                    )
                  }
                )}

              </div>

            )}

          </DashboardPanel>


          {/* =================================================
              TICKETS
              ================================================= */}

          <DashboardPanel
            title="Support Tickets"
            subtitle="Latest escalations and support cases"
            actionText="View all"
            actionTo="/tickets"
          >

            {recentTickets.length === 0 ? (

              <EmptyState
                title="No support tickets"
                description="Escalated issues will appear here."
                actionText="View Conversations"
                actionTo="/conversations"
              />

            ) : (

              <div className="space-y-3">

                {recentTickets.map((ticket) => (

                  <Link
                    key={ticket.ticket_id}
                    to={`/tickets/${ticket.ticket_id}`}
                    className="group block rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-teal-500/40 hover:bg-slate-800/50"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <p className="text-sm font-semibold text-slate-200">
                          {ticket.ticket_id}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-400">
                          {ticket.issue ||
                            'No issue description'}
                        </p>

                      </div>


                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${getTicketStatusClass(
                          ticket.status
                        )}`}
                      >
                        {formatStatus(ticket.status)}
                      </span>

                    </div>


                    <div className="mt-3 flex items-center justify-between">

                      <p className="text-xs text-slate-500">
                        {ticket.order_id
                          ? `Order ${ticket.order_id}`
                          : 'No order linked'}
                      </p>

                      <span className="text-xs text-teal-400 opacity-0 transition group-hover:opacity-100">
                        Open →
                      </span>

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </DashboardPanel>

        </section>


        {/* ===================================================
            AGENT + SYSTEM
        =================================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* =================================================
              AGENT ACTIVITY
              ================================================= */}

          <DashboardPanel
            title="AI Agent Activity"
            subtitle="Current agent operating summary"
            actionText="View activity"
            actionTo="/agent-activity"
          >

            <div className="space-y-4">

              <ActivityRow
                title="Responses Processed"
                description={`${metrics.assistantMessages.length} AI responses stored`}
                value={metrics.assistantMessages.length}
                status="Active"
              />

              <ActivityRow
                title="Average Confidence"
                description="Confidence from stored AI metadata"
                value={`${metrics.averageConfidence}%`}
                status={
                  metrics.averageConfidence >= 80
                    ? 'Healthy'
                    : metrics.averageConfidence > 0
                      ? 'Review'
                      : 'No data'
                }
              />

              <ActivityRow
                title="Human Escalations"
                description="Responses requiring support intervention"
                value={metrics.escalatedMessages}
                status={
                  metrics.escalatedMessages > 0
                    ? 'Attention'
                    : 'Normal'
                }
              />

              <ActivityRow
                title="AI Resolution"
                description="Responses resolved without escalation"
                value={`${metrics.aiResolutionRate}%`}
                status={
                  metrics.aiResolutionRate >= 80
                    ? 'Healthy'
                    : 'Monitor'
                }
              />

            </div>

          </DashboardPanel>


          {/* =================================================
              SYSTEM HEALTH
              ================================================= */}

          <DashboardPanel
            title="System Health"
            subtitle="Core FoodChow AI components"
          >

            <div className="space-y-3">

              <SystemStatus
                name="FastAPI Backend"
                status={
                  backendError
                    ? 'Offline'
                    : 'Online'
                }
              />

              <SystemStatus
                name="MongoDB"
                status="Connected"
              />

              <SystemStatus
                name="Agent Engine"
                status={getAgentEngineStatus()}
              />

              <SystemStatus
                name="Knowledge Base"
                status="Ready"
              />

            </div>


            <div className="mt-5 rounded-xl border border-teal-500/10 bg-teal-500/5 p-4">

              <p className="text-sm font-medium text-teal-300">
                Agent workflow
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Intent detection → context resolution →
                tool execution → verified response →
                escalation when required.
              </p>

            </div>

          </DashboardPanel>

        </section>


        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-5">

            <p className="text-sm font-semibold text-slate-200">
              Quick Actions
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Jump directly into the main support workflows.
            </p>

          </div>


          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <QuickAction
              to="/chat"
              title="Customer Chat"
              description="Test the AI support agent"
              icon="→"
            />

            <QuickAction
              to="/conversations"
              title="Conversations"
              description="Review customer interactions"
              icon="≡"
            />

            <QuickAction
              to="/tickets"
              title="Support Tickets"
              description="Manage escalated issues"
              icon="!"
            />

            <QuickAction
              to="/knowledge"
              title="Knowledge Base"
              description="Review support knowledge"
              icon="⌕"
            />

          </div>

        </section>

      </main>

    </div>
  )
}


// =============================================================
// METRIC CARD
// =============================================================

function MetricCard({
  label,
  value,
  helper,
  icon,
}) {
  return (

    <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">

      <div className="flex items-start justify-between">

        <p className="text-sm font-medium text-slate-400">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-sm text-slate-300 transition group-hover:bg-teal-500/10 group-hover:text-teal-400">
          {icon}
        </div>

      </div>


      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-100">
        {value}
      </p>


      <p className="mt-1 text-xs text-slate-500">
        {helper}
      </p>

    </div>

  )
}


// =============================================================
// SECONDARY METRIC
// =============================================================

function SecondaryMetric({
  label,
  value,
  description,
}) {
  return (

    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-5 py-4">

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-400">
          {label}
        </p>

        <p className="text-xl font-bold text-slate-200">
          {value}
        </p>

      </div>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>

  )
}


// =============================================================
// DASHBOARD PANEL
// =============================================================

function DashboardPanel({
  title,
  subtitle,
  actionText,
  actionTo,
  children,
}) {
  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="mb-5 flex items-start justify-between gap-4">

        <div>

          <h3 className="text-lg font-semibold text-slate-100">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          )}

        </div>


        {actionTo && (

          <Link
            to={actionTo}
            className="shrink-0 text-xs font-medium text-teal-400 transition hover:text-teal-300"
          >
            {actionText} →
          </Link>

        )}

      </div>


      {children}

    </div>

  )
}


// =============================================================
// EMPTY STATE
// =============================================================

function EmptyState({
  title,
  description,
  actionText,
  actionTo,
}) {
  return (

    <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-5 py-10 text-center">

      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
        —
      </div>

      <p className="mt-4 text-sm font-medium text-slate-300">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
        {description}
      </p>

      {actionTo && (

        <Link
          to={actionTo}
          className="mt-4 inline-flex rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-teal-500/30 hover:bg-slate-800"
        >
          {actionText}
        </Link>

      )}

    </div>

  )
}


// =============================================================
// ACTIVITY ROW
// =============================================================

function ActivityRow({
  title,
  description,
  value,
  status,
}) {
  return (

    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 last:border-0 last:pb-0">

      <div className="min-w-0">

        <p className="text-sm font-medium text-slate-200">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>


      <div className="shrink-0 text-right">

        <p className="text-sm font-semibold text-slate-200">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-emerald-400">
          {status}
        </p>

      </div>

    </div>

  )
}


// =============================================================
// SYSTEM STATUS
// =============================================================

function SystemStatus({
  name,
  status,
}) {
  const isOffline = status === 'Offline'

  const isChecking = status === 'Checking'

  return (

    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">

      <div className="flex items-center gap-3">

        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isOffline
              ? 'bg-red-400'
              : isChecking
                ? 'bg-amber-400'
                : 'bg-emerald-400'
          }`}
        />

        <span className="text-sm text-slate-300">
          {name}
        </span>

      </div>


      <span
        className={`text-xs font-medium ${
          isOffline
            ? 'text-red-400'
            : isChecking
              ? 'text-amber-400'
              : 'text-emerald-400'
        }`}
      >
        {status}
      </span>

    </div>

  )
}


// =============================================================
// QUICK ACTION
// =============================================================

function QuickAction({
  to,
  title,
  description,
  icon,
}) {
  return (

    <Link
      to={to}
      className="group rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-teal-500/30 hover:bg-slate-800/50"
    >

      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-sm text-slate-400 transition group-hover:bg-teal-500/10 group-hover:text-teal-400">
          {icon}
        </div>

        <span className="text-slate-600 transition group-hover:text-teal-400">
          →
        </span>

      </div>


      <p className="mt-4 text-sm font-medium text-slate-200">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </Link>

  )
}


export default Dashboard