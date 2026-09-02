import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  Search,
  RefreshCw,
  Ticket,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Inbox,
} from 'lucide-react'

import {
  getTickets,
} from '../services/ticketApi'


function Tickets() {

  const navigate =
    useNavigate()


  // =========================================================
  // STATE
  // =========================================================

  const [
    tickets,
    setTickets,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    refreshing,
    setRefreshing,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const [
    filter,
    setFilter,
  ] = useState('all')

  const [
    search,
    setSearch,
  ] = useState('')


  // =========================================================
  // LOAD TICKETS
  // =========================================================

  async function loadTickets(
    refresh = false,
  ) {

    try {

      if (refresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')


      const result =
        await getTickets()


      if (
        !result ||
        !result.success
      ) {

        throw new Error(
          result?.message ||
          'Unable to load support tickets.',
        )

      }


      const ticketData =
        Array.isArray(result.data)
          ? result.data
          : []


      setTickets(ticketData)

    } catch (err) {

      console.error(
        'Ticket loading error:',
        err,
      )


      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Unable to load support tickets.',
      )

    } finally {

      setLoading(false)

      setRefreshing(false)

    }

  }


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadTickets()

  }, [])


  // =========================================================
  // HELPERS
  // =========================================================

  function normalize(
    value,
  ) {

    return String(
      value ?? '',
    )
      .trim()
      .toLowerCase()

  }


  function formatStatus(
    status,
  ) {

    if (!status) {
      return 'Unknown'
    }


    return String(status)
      .replaceAll('_', ' ')
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase(),
      )

  }


  function formatDate(
    value,
  ) {

    if (!value) {
      return '—'
    }


    const date =
      new Date(value)


    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {

      return String(value)

    }


    return date.toLocaleString(
      undefined,
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    )

  }


  function getPriorityClasses(
    priority,
  ) {

    switch (
      normalize(priority)
    ) {

      case 'high':

        return [
          'border-red-200',
          'bg-red-50',
          'text-red-700',
          'dark:border-red-500/20',
          'dark:bg-red-500/10',
          'dark:text-red-400',
        ].join(' ')


      case 'medium':

        return [
          'border-amber-200',
          'bg-amber-50',
          'text-amber-700',
          'dark:border-amber-500/20',
          'dark:bg-amber-500/10',
          'dark:text-amber-400',
        ].join(' ')


      case 'low':

        return [
          'border-emerald-200',
          'bg-emerald-50',
          'text-emerald-700',
          'dark:border-emerald-500/20',
          'dark:bg-emerald-500/10',
          'dark:text-emerald-400',
        ].join(' ')


      default:

        return [
          'border-slate-200',
          'bg-slate-50',
          'text-slate-600',
          'dark:border-slate-700',
          'dark:bg-slate-800',
          'dark:text-slate-400',
        ].join(' ')

    }

  }


  function getStatusClasses(
    status,
  ) {

    switch (
      normalize(status)
    ) {

      case 'open':

        return [
          'border-blue-200',
          'bg-blue-50',
          'text-blue-700',
          'dark:border-blue-500/20',
          'dark:bg-blue-500/10',
          'dark:text-blue-400',
        ].join(' ')


      case 'in_progress':

        return [
          'border-amber-200',
          'bg-amber-50',
          'text-amber-700',
          'dark:border-amber-500/20',
          'dark:bg-amber-500/10',
          'dark:text-amber-400',
        ].join(' ')


      case 'resolved':

        return [
          'border-emerald-200',
          'bg-emerald-50',
          'text-emerald-700',
          'dark:border-emerald-500/20',
          'dark:bg-emerald-500/10',
          'dark:text-emerald-400',
        ].join(' ')


      case 'closed':

        return [
          'border-slate-200',
          'bg-slate-50',
          'text-slate-600',
          'dark:border-slate-700',
          'dark:bg-slate-800',
          'dark:text-slate-400',
        ].join(' ')


      default:

        return [
          'border-slate-200',
          'bg-slate-50',
          'text-slate-600',
          'dark:border-slate-700',
          'dark:bg-slate-800',
          'dark:text-slate-400',
        ].join(' ')

    }

  }


  // =========================================================
  // METRICS
  // =========================================================

  const metrics =
    useMemo(() => {

      const total =
        tickets.length


      const open =
        tickets.filter(
          (ticket) =>
            normalize(
              ticket.status,
            ) === 'open',
        ).length


      const inProgress =
        tickets.filter(
          (ticket) =>
            normalize(
              ticket.status,
            ) === 'in_progress',
        ).length


      const resolved =
        tickets.filter(
          (ticket) =>
            normalize(
              ticket.status,
            ) === 'resolved',
        ).length


      const highPriority =
        tickets.filter(
          (ticket) =>
            normalize(
              ticket.priority,
            ) === 'high',
        ).length


      return {
        total,
        open,
        inProgress,
        resolved,
        highPriority,
      }

    }, [
      tickets,
    ])


  // =========================================================
  // FILTERED TICKETS
  // =========================================================

  const filteredTickets =
    useMemo(() => {

      const query =
        normalize(search)


      return tickets.filter(
        (ticket) => {

          const status =
            normalize(
              ticket.status,
            )


          if (
            filter !== 'all' &&
            status !== filter
          ) {

            return false

          }


          if (!query) {
            return true
          }


          const searchable =
            [
              ticket.ticket_id,
              ticket.issue,
              ticket.order_id,
              ticket.customer_id,
              ticket.priority,
              ticket.status,
            ]
              .map(normalize)
              .join(' ')


          return searchable.includes(
            query,
          )

        },
      )

    }, [
      tickets,
      filter,
      search,
    ])


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="foodchow-page-enter min-h-full">

      {/* =====================================================
          PAGE HERO
      ===================================================== */}

      <section className="foodchow-page-header">

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">

                  <Ticket size={16} />

                </span>

                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">

                  Support Operations

                </span>

              </div>


              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-strong)] sm:text-3xl">

                Support Tickets

              </h1>


              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">

                Manage issues escalated from the FoodChow AI
                support agent and track every case through
                human resolution.

              </p>

            </div>


            <div className="flex flex-wrap items-center gap-3">

              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text)] shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10"
              >

                Open AI Chat

                <ArrowRight size={15} />

              </Link>


              <button
                type="button"
                onClick={() =>
                  loadTickets(true)
                }
                disabled={
                  loading ||
                  refreshing
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }
                />

                {refreshing
                  ? 'Refreshing...'
                  : 'Refresh Queue'}

              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">

                <AlertTriangle
                  size={18}
                />

              </div>


              <div className="min-w-0">

                <p className="text-sm font-semibold text-red-700 dark:text-red-300">

                  Unable to load support queue

                </p>


                <p className="mt-1 text-xs leading-5 text-red-600/80 dark:text-red-300/70">

                  {error}

                </p>

              </div>

            </div>

          </div>

        )}


        {/* ===================================================
            METRICS
        =================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <MetricCard
            icon={
              <Ticket size={18} />
            }
            label="Total Tickets"
            value={
              metrics.total
            }
            description="All support cases"
            iconClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          />


          <MetricCard
            icon={
              <Inbox size={18} />
            }
            label="Open"
            value={
              metrics.open
            }
            description="Awaiting support"
            iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
          />


          <MetricCard
            icon={
              <Clock3 size={18} />
            }
            label="In Progress"
            value={
              metrics.inProgress
            }
            description="Being handled"
            iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
          />


          <MetricCard
            icon={
              <CheckCircle2 size={18} />
            }
            label="Resolved"
            value={
              metrics.resolved
            }
            description="Completed cases"
            iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          />


          <MetricCard
            icon={
              <AlertTriangle size={18} />
            }
            label="High Priority"
            value={
              metrics.highPriority
            }
            description="Requires attention"
            iconClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
          />

        </section>


        {/* ===================================================
            FILTER / SEARCH
        =================================================== */}

        <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="relative w-full xl:max-w-md">

              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />


              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search ticket, order, customer or issue..."
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-4 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            <div className="flex flex-wrap gap-2">

              <FilterButton
                active={
                  filter === 'all'
                }
                onClick={() =>
                  setFilter('all')
                }
              >
                All
              </FilterButton>


              <FilterButton
                active={
                  filter === 'open'
                }
                onClick={() =>
                  setFilter('open')
                }
              >
                Open
              </FilterButton>


              <FilterButton
                active={
                  filter === 'in_progress'
                }
                onClick={() =>
                  setFilter(
                    'in_progress',
                  )
                }
              >
                In Progress
              </FilterButton>


              <FilterButton
                active={
                  filter === 'resolved'
                }
                onClick={() =>
                  setFilter(
                    'resolved',
                  )
                }
              >
                Resolved
              </FilterButton>


              <FilterButton
                active={
                  filter === 'closed'
                }
                onClick={() =>
                  setFilter('closed')
                }
              >
                Closed
              </FilterButton>

            </div>

          </div>

        </section>


        {/* ===================================================
            QUEUE
        =================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">

          {/* Queue header */}

          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-base font-semibold text-[var(--text-strong)]">

                  Support Queue

                </h2>


                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">

                  {filteredTickets.length}

                </span>

              </div>


              <p className="mt-1 text-xs text-[var(--muted)]">

                Tickets matching the current view

              </p>

            </div>


            <div className="flex items-center gap-2">

              <span className="relative flex h-2.5 w-2.5">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />

              </span>


              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">

                Queue connected

              </span>

            </div>

          </div>


          {/* Loading */}

          {loading && (

            <div className="flex min-h-[320px] flex-col items-center justify-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">

                <RefreshCw
                  size={20}
                  className="animate-spin"
                />

              </div>


              <p className="mt-4 text-sm font-medium text-[var(--text)]">

                Loading support queue...

              </p>


              <p className="mt-1 text-xs text-[var(--muted)]">

                Fetching the latest tickets

              </p>

            </div>

          )}


          {/* Empty */}

          {!loading &&
            !error &&
            filteredTickets.length === 0 && (

              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">

                  <Ticket
                    size={24}
                  />

                </div>


                <h3 className="mt-5 text-sm font-semibold text-[var(--text-strong)]">

                  {tickets.length === 0
                    ? 'No support tickets yet'
                    : 'No matching tickets'}

                </h3>


                <p className="mt-2 max-w-sm text-xs leading-5 text-[var(--muted)]">

                  {tickets.length === 0
                    ? 'When the AI agent escalates an issue, the resulting support ticket will appear here.'
                    : 'Try changing the status filter or search query.'}

                </p>


                {tickets.length === 0 && (

                  <Link
                    to="/chat"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >

                    Test AI Support

                    <ArrowRight
                      size={14}
                    />

                  </Link>

                )}

              </div>

            )}


          {/* Table */}

          {!loading &&
            !error &&
            filteredTickets.length > 0 && (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] text-left">

                  <thead>

                    <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">

                      <TableHeader>
                        Ticket
                      </TableHeader>

                      <TableHeader>
                        Customer Issue
                      </TableHeader>

                      <TableHeader>
                        Order
                      </TableHeader>

                      <TableHeader>
                        Priority
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                      <TableHeader>
                        Created
                      </TableHeader>

                      <TableHeader>
                        Action
                      </TableHeader>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredTickets.map(
                      (
                        ticket,
                      ) => (

                        <tr
                          key={
                            ticket.ticket_id
                          }
                          className="group border-b border-[var(--border)] transition last:border-0 hover:bg-blue-50/40 dark:hover:bg-blue-500/[0.03]"
                        >

                          {/* Ticket */}

                          <td className="px-6 py-5">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/tickets/${ticket.ticket_id}`,
                                )
                              }
                              className="group/ticket inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400"
                            >

                              {ticket.ticket_id}

                              <ExternalLink
                                size={12}
                                className="opacity-0 transition group-hover/ticket:opacity-100"
                              />

                            </button>

                          </td>


                          {/* Issue */}

                          <td className="max-w-md px-6 py-5">

                            <p
                              title={
                                ticket.issue ||
                                ''
                              }
                              className="truncate text-sm font-medium text-[var(--text)]"
                            >

                              {ticket.issue ||
                                'No issue description'}

                            </p>


                            <p className="mt-1 text-xs text-[var(--muted)]">

                              Human support case

                            </p>

                          </td>


                          {/* Order */}

                          <td className="px-6 py-5">

                            {ticket.order_id ? (

                              <span className="rounded-lg bg-[var(--surface-soft)] px-2.5 py-1.5 font-mono text-xs text-[var(--text)]">

                                {ticket.order_id}

                              </span>

                            ) : (

                              <span className="text-xs text-[var(--muted)]">

                                Not linked

                              </span>

                            )}

                          </td>


                          {/* Priority */}

                          <td className="px-6 py-5">

                            <span
                              className={[
                                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                                getPriorityClasses(
                                  ticket.priority ||
                                  'medium',
                                ),
                              ].join(' ')}
                            >

                              {formatStatus(
                                ticket.priority ||
                                'medium',
                              )}

                            </span>

                          </td>


                          {/* Status */}

                          <td className="px-6 py-5">

                            <span
                              className={[
                                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                                getStatusClasses(
                                  ticket.status,
                                ),
                              ].join(' ')}
                            >

                              <span className="h-1.5 w-1.5 rounded-full bg-current" />

                              {formatStatus(
                                ticket.status,
                              )}

                            </span>

                          </td>


                          {/* Created */}

                          <td className="whitespace-nowrap px-6 py-5">

                            <span className="text-xs text-[var(--muted)]">

                              {formatDate(
                                ticket.created_at,
                              )}

                            </span>

                          </td>


                          {/* Action */}

                          <td className="px-6 py-5">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/tickets/${ticket.ticket_id}`,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                            >

                              Open

                              <ArrowRight
                                size={13}
                              />

                            </button>

                          </td>

                        </tr>

                      ),
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>


        {/* ===================================================
            INFORMATION CARDS
        =================================================== */}

        <section className="mt-6 grid gap-4 md:grid-cols-3">

          <InfoCard
            icon={
              <Ticket
                size={17}
              />
            }
            title="AI → Human Handoff"
            description="Issues that cannot be safely resolved automatically are routed to human support."
            iconClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          />


          <InfoCard
            icon={
              <CheckCircle2
                size={17}
              />
            }
            title="Verified Context"
            description="Tickets retain relevant order and operational context when that information is available."
            iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          />


          <InfoCard
            icon={
              <Clock3
                size={17}
              />
            }
            title="Support Workflow"
            description="Open → In Progress → Resolved → Closed provides a clear case lifecycle."
            iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
          />

        </section>

      </main>

    </div>

  )
}


// =============================================================
// METRIC CARD
// =============================================================

function MetricCard({
  icon,
  label,
  value,
  description,
  iconClass,
}) {

  return (

    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-xs font-medium text-[var(--muted)]">

            {label}

          </p>


          <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-strong)]">

            {value}

          </p>


          <p className="mt-1 text-xs text-[var(--muted)]">

            {description}

          </p>

        </div>


        <div
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            iconClass,
          ].join(' ')}
        >

          {icon}

        </div>

      </div>

    </div>

  )
}


// =============================================================
// FILTER BUTTON
// =============================================================

function FilterButton({
  active,
  onClick,
  children,
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? [
              'rounded-xl bg-blue-600 px-4 py-2.5',
              'text-xs font-semibold text-white',
              'shadow-md shadow-blue-600/15',
            ].join(' ')
          : [
              'rounded-xl border border-[var(--border)]',
              'bg-[var(--surface)] px-4 py-2.5',
              'text-xs font-medium text-[var(--muted)]',
              'transition hover:border-blue-300',
              'hover:bg-blue-50 hover:text-blue-700',
              'dark:hover:bg-blue-500/10',
              'dark:hover:text-blue-400',
            ].join(' ')
      }
    >

      {children}

    </button>

  )
}


// =============================================================
// TABLE HEADER
// =============================================================

function TableHeader({
  children,
}) {

  return (

    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">

      {children}

    </th>

  )
}


// =============================================================
// INFO CARD
// =============================================================

function InfoCard({
  icon,
  title,
  description,
  iconClass,
}) {

  return (

    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

      <div
        className={[
          'flex h-9 w-9 items-center justify-center rounded-xl',
          iconClass,
        ].join(' ')}
      >

        {icon}

      </div>


      <h3 className="mt-4 text-sm font-semibold text-[var(--text-strong)]">

        {title}

      </h3>


      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">

        {description}

      </p>

    </div>

  )
}


export default Tickets