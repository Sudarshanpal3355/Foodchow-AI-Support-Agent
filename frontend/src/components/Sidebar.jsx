import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  CircleHelp,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Ticket,
  X,
} from 'lucide-react'

import {
  NavLink,
} from 'react-router-dom'

import {
  useEffect,
  useState,
} from 'react'

import {
  useApp,
} from '../context/AppContext'

import {
  getAgentStatus,
} from '../services/agentApi'

import foodchowLogo
  from '../assets/foodchow-logo.png'


function Sidebar() {

  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    closeMobileSidebar,
    handleMobileNavigation,
  } = useApp()


  const [
    agentStatus,
    setAgentStatus,
  ] = useState(null)


  /* ==========================================================
     AGENT STATUS
     ========================================================== */

  useEffect(() => {

    let mounted = true


    async function loadAgentStatus() {

      try {

        const response =
          await getAgentStatus()


        if (!mounted) {
          return
        }


        const data =
          response?.data ??
          response


        const status =
          data?.status ??
          data?.online ??
          data?.active ??
          false


        setAgentStatus(
          Boolean(status),
        )

      } catch (error) {

        console.error(
          'Unable to load agent status:',
          error,
        )


        if (mounted) {

          setAgentStatus(false)

        }

      }

    }


    loadAgentStatus()


    const interval =
      window.setInterval(
        loadAgentStatus,
        30000,
      )


    return () => {

      mounted = false

      window.clearInterval(
        interval,
      )

    }

  }, [])


  const navigation = [

    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },

    {
      label: 'AI Chat',
      path: '/chat',
      icon: Bot,
    },

    {
      label: 'Conversations',
      path: '/conversations',
      icon: MessageSquare,
    },

    {
      label: 'Tickets',
      path: '/tickets',
      icon: Ticket,
    },

    {
      label: 'Agent Activity',
      path: '/agent-activity',
      icon: Activity,
    },

    {
      label: 'Knowledge',
      path: '/knowledge',
      icon: BookOpen,
    },

    {
      label: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
    },

    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
    },

  ]


  return (

    <>

      {/* ======================================================
          MOBILE OVERLAY
          ====================================================== */}

      {mobileSidebarOpen && (

        <button
          type="button"
          aria-label="Close navigation"
          onClick={
            closeMobileSidebar
          }
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />

      )}


      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
        className={[
          'fixed left-0 top-0 z-50 flex h-screen flex-col',
          'border-r border-[var(--border)]',
          'bg-[var(--surface)]',
          'shadow-[8px_0_30px_rgba(15,118,110,0.04)]',
          'transition-all duration-300 ease-out',

          sidebarCollapsed
            ? 'w-[76px]'
            : 'w-64',

          mobileSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >

        {/* ====================================================
            BRAND
            ==================================================== */}

        <div
          className={[
            'relative flex h-[78px] shrink-0 items-center',
            'border-b border-[var(--border)]',

            sidebarCollapsed
              ? 'justify-center px-3'
              : 'px-5',
          ].join(' ')}
        >

          {sidebarCollapsed ? (

            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[var(--border)]">

              <img
                src={foodchowLogo}
                alt="FoodChow"
                className="h-11 w-auto max-w-none object-cover object-left"
              />

            </div>

          ) : (

            <img
              src={foodchowLogo}
              alt="FoodChow"
              className="h-auto w-[150px] object-contain"
            />

          )}


          {/* Mobile close */}

          <button
            type="button"
            onClick={
              closeMobileSidebar
            }
            aria-label="Close sidebar"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted)] hover:bg-[var(--surface-soft)] lg:hidden"
          >

            <X size={18} />

          </button>

        </div>


        {/* ====================================================
            NAVIGATION
            ==================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          {!sidebarCollapsed && (

            <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted-light)]">

              Workspace

            </p>

          )}


          <div className="space-y-1.5">

            {navigation.map(
              ({
                label,
                path,
                icon: Icon,
              }) => (

                <NavLink
                  key={path}
                  to={path}
                  end={
                    path === '/'
                  }
                  onClick={
                    handleMobileNavigation
                  }
                  title={
                    sidebarCollapsed
                      ? label
                      : undefined
                  }
                  className={({ isActive }) =>
                    [
                      'group relative flex items-center',
                      'rounded-xl transition-all duration-200',

                      sidebarCollapsed
                        ? 'h-11 justify-center px-0'
                        : 'h-11 gap-3 px-3',

                      isActive
                        ? [
                            'bg-[var(--primary-soft)]',
                            'text-[var(--primary-dark)]',
                            'shadow-sm',
                            'dark:text-[var(--primary)]',
                          ].join(' ')
                        : [
                            'text-[var(--muted)]',
                            'hover:bg-[var(--surface-soft)]',
                            'hover:text-[var(--text)]',
                          ].join(' '),
                    ].join(' ')
                  }
                >

                  {({ isActive }) => (

                    <>

                      {isActive && (

                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--primary)]" />

                      )}


                      <span
                        className={[
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          'border border-[var(--primary-border)]',
                          'bg-[var(--primary-soft)]',
                          'text-[var(--primary)]',
                          'transition-all duration-200',

                          isActive
                            ? 'shadow-sm'
                            : 'group-hover:border-[var(--primary)] group-hover:bg-[var(--primary-soft)]',
                        ].join(' ')}
                      >

                        <Icon
                          size={18}
                          strokeWidth={
                            isActive
                              ? 2.2
                              : 1.8
                          }
                        />

                      </span>


                      {!sidebarCollapsed && (

                        <span className="truncate text-[13px] font-medium">

                          {label}

                        </span>

                      )}

                    </>

                  )}

                </NavLink>

              ),
            )}

          </div>


          {/* ==================================================
              AI AGENT CARD
              ================================================== */}

          <div className="mt-7">

            {!sidebarCollapsed ? (

              <div className="rounded-2xl border border-[var(--primary-border)] bg-[var(--primary-soft)] p-4">

                <div className="flex items-start gap-3">

                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-md shadow-teal-700/20">

                    <Bot size={17} />


                    <span
                      className={[
                        'absolute -right-0.5 -top-0.5',
                        'h-2.5 w-2.5 rounded-full',
                        'ring-2 ring-[var(--surface)]',

                        agentStatus
                          ? 'bg-emerald-500'
                          : 'bg-amber-500',
                      ].join(' ')}
                    />

                  </div>


                  <div className="min-w-0">

                    <p className="text-xs font-semibold text-[var(--text-strong)]">

                      FoodChow AI

                    </p>


                    <div className="mt-1 flex items-center gap-1.5">

                      <span
                        className={[
                          'h-1.5 w-1.5 rounded-full',

                          agentStatus
                            ? 'bg-emerald-500'
                            : 'bg-amber-500',
                        ].join(' ')}
                      />


                      <span
                        className={[
                          'text-[9px] font-semibold',

                          agentStatus
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400',
                        ].join(' ')}
                      >

                        {agentStatus
                          ? 'AI Agent Online'
                          : 'Checking agent...'}

                      </span>

                    </div>

                  </div>

                </div>


                <p className="mt-3 text-[10px] leading-4 text-[var(--muted)]">

                  Automated support, operational tools and intelligent escalation.

                </p>

              </div>

            ) : (

              <div
                title={
                  agentStatus
                    ? 'AI Agent Online'
                    : 'Checking agent...'
                }
                className="flex justify-center"
              >

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-md shadow-teal-700/20">

                  <Bot size={18} />


                  <span
                    className={[
                      'absolute -right-0.5 -top-0.5',
                      'h-2.5 w-2.5 rounded-full',
                      'ring-2 ring-[var(--surface)]',

                      agentStatus
                        ? 'bg-emerald-500'
                        : 'bg-amber-500',
                    ].join(' ')}
                  />

                </div>

              </div>

            )}

          </div>

        </nav>


        {/* ====================================================
            HELP
            ==================================================== */}

        <div className="px-3 pb-3">

          <button
            type="button"
            title={
              sidebarCollapsed
                ? 'Help & Support'
                : undefined
            }
            className={[
              'flex w-full items-center rounded-xl',
              'text-[var(--muted)]',
              'transition-colors duration-200',
              'hover:bg-[var(--surface-soft)]',
              'hover:text-[var(--text)]',

              sidebarCollapsed
                ? 'h-11 justify-center'
                : 'h-10 gap-3 px-3',
            ].join(' ')}
          >

            <CircleHelp size={17} />


            {!sidebarCollapsed && (

              <span className="text-xs font-medium">

                Help & Support

              </span>

            )}

          </button>

        </div>


        {/* ====================================================
            ADMIN
            ==================================================== */}

        <div className="border-t border-[var(--border)] p-3">

          {sidebarCollapsed ? (

            <button
              type="button"
              title="System Admin"
              className="flex h-11 w-full items-center justify-center rounded-xl transition hover:bg-[var(--surface-soft)]"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--charcoal)] text-xs font-bold text-white">

                SA

              </div>

            </button>

          ) : (

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[var(--surface-soft)]"
            >

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--charcoal)] text-xs font-bold text-white">

                SA

              </div>


              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-semibold text-[var(--text-strong)]">

                  System Admin

                </p>


                <p className="mt-0.5 truncate text-[10px] text-[var(--muted)]">

                  Administrator

                </p>

              </div>


            </button>

          )}

        </div>

      </aside>

    </>

  )
}


export default Sidebar