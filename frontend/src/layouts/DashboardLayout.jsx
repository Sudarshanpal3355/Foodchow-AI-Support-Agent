import {
  Activity,
  Bell,
  Bot,
  Check,
  ChevronDown,
  Command,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Ticket,
  UserPlus,
  Users,
  X,
} from 'lucide-react'

import {
  Link,
  useLocation,
} from 'react-router-dom'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import Sidebar from '../components/Sidebar'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { getAgentStatus } from '../services/agentApi'

import foodchowLogo from '../assets/foodchow-logo.png'


// ============================================================
// DASHBOARD LAYOUT
// ============================================================

function DashboardLayout({
  children,
}) {

  const {
    theme,
    toggleTheme,
    sidebarCollapsed,
    setMobileSidebarOpen,
    toggleSidebar,
  } = useApp()


  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth()


  const location = useLocation()


  // ==========================================================
  // DROPDOWN STATE
  // ==========================================================

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false)


  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false)


  // ==========================================================
  // AGENT STATUS
  // ==========================================================

  const [
    agentStatus,
    setAgentStatus,
  ] = useState(null)


  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const [
    notifications,
    setNotifications,
  ] = useState([
    {
      id: 1,
      type: 'agent',
      title: 'AI Agent is online',
      description:
        'FoodChow AI Support Agent is ready to handle customer requests.',
      time: 'Now',
      read: false,
    },

    {
      id: 2,
      type: 'ticket',
      title: 'Support queue active',
      description:
        'Escalated customer issues are available in the support queue.',
      time: 'Recently',
      read: false,
    },

    {
      id: 3,
      type: 'activity',
      title: 'Agent monitoring enabled',
      description:
        'AI tool execution and escalation activity is being recorded.',
      time: 'Today',
      read: true,
    },
  ])


  // ==========================================================
  // REFS
  // ==========================================================

  const notificationRef =
    useRef(null)

  const profileRef =
    useRef(null)


  // ==========================================================
  // PAGE TITLE
  // ==========================================================

  const pageTitle =
    getPageTitle(
      location.pathname,
    )


  // ==========================================================
  // LOAD AGENT STATUS
  // ==========================================================

  useEffect(() => {

    let cancelled = false


    async function loadStatus() {

      try {

        const result =
          await getAgentStatus()


        if (cancelled) {
          return
        }


        if (result?.success) {

          setAgentStatus(
            result.data,
          )

        }

      } catch (error) {

        console.error(
          'Unable to load agent status:',
          error,
        )


        if (!cancelled) {
          setAgentStatus(null)
        }

      }

    }


    loadStatus()


    return () => {
      cancelled = true
    }

  }, [])


  // ==========================================================
  // DETERMINE AGENT ONLINE STATE
  // ==========================================================

  const isAgentOnline =
    getAgentOnlineState(
      agentStatus,
    )


  // ==========================================================
  // UNREAD COUNT
  // ==========================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read,
    ).length


  // ==========================================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // ==========================================================

  useEffect(() => {

    function handleOutsideClick(
      event,
    ) {

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target,
        )
      ) {

        setNotificationOpen(
          false,
        )

      }


      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target,
        )
      ) {

        setProfileOpen(
          false,
        )

      }

    }


    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    )


    return () => {

      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      )

    }

  }, [])


  // ==========================================================
  // ESCAPE KEY
  // ==========================================================

  useEffect(() => {

    function handleEscape(
      event,
    ) {

      if (
        event.key !==
        'Escape'
      ) {
        return
      }


      setNotificationOpen(
        false,
      )


      setProfileOpen(
        false,
      )

    }


    document.addEventListener(
      'keydown',
      handleEscape,
    )


    return () => {

      document.removeEventListener(
        'keydown',
        handleEscape,
      )

    }

  }, [])


  // ==========================================================
  // CLOSE MENUS WHEN ROUTE CHANGES
  // ==========================================================

  useEffect(() => {

    setNotificationOpen(
      false,
    )


    setProfileOpen(
      false,
    )

  }, [location.pathname])


  // ==========================================================
  // NOTIFICATION FUNCTIONS
  // ==========================================================

  function markNotificationRead(
    id,
  ) {

    setNotifications(
      (current) =>
        current.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification,
        ),
    )

  }


  function markAllNotificationsRead() {

    setNotifications(
      (current) =>
        current.map(
          (notification) => ({
            ...notification,
            read: true,
          }),
        ),
    )

  }


  function clearNotifications() {

    setNotifications([])

  }


  // ==========================================================
  // LOGOUT
  // ==========================================================

  function handleLogout() {

    logout()

    setProfileOpen(false)

  }


  // ==========================================================
  // USER DISPLAY
  // ==========================================================

  const displayName =
    user?.name ||
    'Guest'


  const displayRole =
    formatRole(
      user?.role,
    )


  const userInitials =
    getInitials(
      user?.name,
    )


  // ==========================================================
  // NOTIFICATION ICON
  // ==========================================================

  function getNotificationIcon(
    type,
  ) {

    if (
      type === 'ticket'
    ) {

      return (
        <Ticket
          size={15}
          className="text-amber-500"
        />
      )

    }


    if (
      type === 'activity'
    ) {

      return (
        <Activity
          size={15}
          className="text-violet-500"
        />
      )

    }


    return (
      <Bot
        size={15}
        className="text-emerald-500"
      />
    )

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors duration-300">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <Sidebar />


      {/* =====================================================
          MAIN SHELL
          ===================================================== */}

      <div
        className={[
          'min-h-screen transition-all duration-300',
          sidebarCollapsed
            ? 'lg:ml-[76px]'
            : 'lg:ml-64',
        ].join(' ')}
      >

        {/* ===================================================
            TOPBAR
            =================================================== */}

        <header className="sticky top-0 z-40 h-[76px] border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl">

          <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">

            {/* =================================================
                LEFT SIDE
                ================================================= */}

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">

              {/* MOBILE MENU */}

              <button
                type="button"
                onClick={() =>
                  setMobileSidebarOpen(
                    true,
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] transition hover:border-[var(--primary-border)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] lg:hidden"
                aria-label="Open navigation"
              >

                <Menu size={18} />

              </button>


              {/* DESKTOP SIDEBAR TOGGLE */}

              <button
                type="button"
                onClick={
                  toggleSidebar
                }
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] transition hover:border-[var(--primary-border)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] lg:flex"
                title={
                  sidebarCollapsed
                    ? 'Expand sidebar'
                    : 'Collapse sidebar'
                }
                aria-label={
                  sidebarCollapsed
                    ? 'Expand sidebar'
                    : 'Collapse sidebar'
                }
              >

                <Menu size={17} />

              </button>


              {/* =================================================
                  FOODCHOW LOGO
                  ================================================= */}

              <Link
                to="/"
                className="group hidden items-center sm:flex"
                aria-label="FoodChow Dashboard"
              >

                <div className="flex h-11 items-center rounded-xl bg-white px-3 shadow-sm ring-1 ring-slate-200 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">

                  <img
                    src={foodchowLogo}
                    alt="FoodChow"
                    className="h-8 w-auto object-contain"
                  />

                </div>

              </Link>


              {/* DIVIDER */}

              <div className="hidden h-8 w-px bg-[var(--border)] sm:block" />


              {/* PAGE TITLE */}

              <div className="min-w-0">

                <div className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] sm:flex">

                  <ShieldCheck
                    size={12}
                  />

                  FoodChow Support

                </div>


                <h1 className="truncate text-sm font-bold text-[var(--text)] sm:mt-0.5">

                  {pageTitle}

                </h1>

              </div>

            </div>


            {/* =================================================
                GLOBAL SEARCH
                ================================================= */}

            <div className="hidden flex-1 justify-center px-6 lg:flex">

              <div className="flex h-10 w-full max-w-lg items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 transition focus-within:border-[var(--primary-border)] focus-within:ring-4 focus-within:ring-teal-500/5">

                <Search
                  size={16}
                  className="shrink-0 text-[var(--muted)]"
                />


                <input
                  type="text"
                  placeholder="Search conversations, tickets..."
                  className="h-full flex-1 bg-transparent text-xs text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                  onKeyDown={(
                    event,
                  ) => {

                    if (
                      event.key ===
                      'Enter'
                    ) {

                      const value =
                        event.target.value.trim()


                      if (!value) {
                        return
                      }


                      console.log(
                        'Global search:',
                        value,
                      )

                    }

                  }}
                />


                <span className="hidden items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] text-[var(--muted)] xl:flex">

                  <Command
                    size={10}
                  />

                  K

                </span>

              </div>

            </div>


            {/* =================================================
                RIGHT SIDE
                ================================================= */}

            <div className="flex shrink-0 items-center gap-2">

              {/* =================================================
                  THEME BUTTON
                  ================================================= */}

              <button
                type="button"
                onClick={
                  toggleTheme
                }
                title={
                  theme ===
                  'light'
                    ? 'Switch to dark mode'
                    : 'Switch to light mode'
                }
                aria-label={
                  theme ===
                  'light'
                    ? 'Switch to dark mode'
                    : 'Switch to light mode'
                }
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[var(--primary-border)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >

                {theme ===
                'light' ? (

                  <Moon
                    size={17}
                    className="transition-transform duration-300 group-hover:rotate-12"
                  />

                ) : (

                  <Sun
                    size={17}
                    className="transition-transform duration-300 group-hover:rotate-45"
                  />

                )}

              </button>


              {/* =================================================
                  NOTIFICATION
                  ================================================= */}

              <div
                ref={
                  notificationRef
                }
                className="relative"
              >

                <button
                  type="button"
                  onClick={() => {

                    setNotificationOpen(
                      (current) =>
                        !current,
                    )


                    setProfileOpen(
                      false,
                    )

                  }}
                  title="Notifications"
                  aria-label="Notifications"
                  aria-expanded={
                    notificationOpen
                  }
                  className={[
                    'relative flex h-10 w-10 items-center justify-center rounded-xl border transition',
                    notificationOpen
                      ? 'border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary-border)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]',
                  ].join(
                    ' ',
                  )}
                >

                  <Bell
                    size={17}
                    className={
                      unreadCount >
                      0
                        ? 'animate-pulse'
                        : ''
                    }
                  />


                  {unreadCount >
                    0 && (

                    <span className="absolute right-2 top-2 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-red-500">

                      <span className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-50" />

                    </span>

                  )}

                </button>


                {/* =================================================
                    NOTIFICATION DROPDOWN
                    ================================================= */}

                {notificationOpen && (

                  <div className="absolute right-0 top-12 z-50 w-[calc(100vw-32px)] max-w-[380px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-slate-900/15">

                    <div className="border-b border-[var(--border)] px-4 py-3.5">

                      <div className="flex items-center justify-between gap-3">

                        <div>

                          <div className="flex items-center gap-2">

                            <h2 className="text-sm font-bold text-[var(--text)]">
                              Notifications
                            </h2>


                            {unreadCount >
                              0 && (

                              <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-bold text-teal-600 dark:text-teal-400">

                                {unreadCount}{' '}
                                new

                              </span>

                            )}

                          </div>


                          <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                            FoodChow AI system activity
                          </p>

                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            setNotificationOpen(
                              false,
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                          aria-label="Close notifications"
                        >

                          <X size={14} />

                        </button>

                      </div>

                    </div>


                    <div className="max-h-[360px] overflow-y-auto">

                      {notifications.length ===
                      0 ? (

                        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">

                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--muted)]">

                            <Bell
                              size={18}
                            />

                          </div>


                          <p className="mt-3 text-xs font-bold text-[var(--text)]">
                            All caught up
                          </p>


                          <p className="mt-1 max-w-[240px] text-[10px] leading-5 text-[var(--muted)]">
                            There are no notifications waiting for you.
                          </p>

                        </div>

                      ) : (

                        notifications.map(
                          (
                            notification,
                          ) => (

                            <button
                              key={
                                notification.id
                              }
                              type="button"
                              onClick={() =>
                                markNotificationRead(
                                  notification.id,
                                )
                              }
                              className={[
                                'flex w-full gap-3 border-b border-[var(--border)] px-4 py-3.5 text-left transition last:border-b-0 hover:bg-[var(--surface-soft)]',
                                notification.read
                                  ? ''
                                  : 'bg-teal-500/[0.025]',
                              ].join(
                                ' ',
                              )}
                            >

                              <div
                                className={[
                                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                                  notification.type ===
                                    'ticket'
                                    ? 'bg-amber-500/10'
                                    : notification.type ===
                                        'activity'
                                      ? 'bg-violet-500/10'
                                      : 'bg-emerald-500/10',
                                ].join(
                                  ' ',
                                )}
                              >

                                {getNotificationIcon(
                                  notification.type,
                                )}

                              </div>


                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-3">

                                  <p className="text-xs font-bold text-[var(--text)]">

                                    {
                                      notification.title
                                    }

                                  </p>


                                  {!notification.read && (

                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />

                                  )}

                                </div>


                                <p className="mt-1 text-[10px] leading-5 text-[var(--muted)]">

                                  {
                                    notification.description
                                  }

                                </p>


                                <p className="mt-1.5 text-[9px] font-medium text-[var(--muted)]">

                                  {
                                    notification.time
                                  }

                                </p>

                              </div>

                            </button>

                          ),
                        )

                      )}

                    </div>


                    <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">

                      <button
                        type="button"
                        onClick={
                          markAllNotificationsRead
                        }
                        disabled={
                          unreadCount ===
                          0
                        }
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)] transition hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                      >

                        <Check
                          size={12}
                        />

                        Mark all read

                      </button>


                      <div className="flex items-center gap-3">

                        <button
                          type="button"
                          onClick={
                            clearNotifications
                          }
                          disabled={
                            notifications.length ===
                            0
                          }
                          className="text-[10px] font-semibold text-[var(--muted)] transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >

                          Clear

                        </button>


                        <Link
                          to="/agent-activity"
                          onClick={() =>
                            setNotificationOpen(
                              false,
                            )
                          }
                          className="text-[10px] font-bold text-[var(--primary)]"
                        >

                          View activity →

                        </Link>

                      </div>

                    </div>

                  </div>

                )}

              </div>


              {/* =================================================
                  PROFILE
                  ================================================= */}

              <div
                ref={profileRef}
                className="relative"
              >

                <button
                  type="button"
                  onClick={() => {

                    setProfileOpen(
                      (current) =>
                        !current,
                    )


                    setNotificationOpen(
                      false,
                    )

                  }}
                  aria-label="Open profile menu"
                  aria-expanded={
                    profileOpen
                  }
                  className={[
                    'hidden h-10 items-center gap-2 rounded-xl border px-2.5 transition sm:flex',
                    profileOpen
                      ? 'border-[var(--primary-border)] bg-[var(--primary-soft)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary-border)] hover:bg-[var(--surface-soft)]',
                  ].join(
                    ' ',
                  )}
                >

                  {/* AVATAR */}

                  <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--charcoal)] text-[10px] font-bold text-white shadow-sm">

                    {userInitials}


                    <span
                      className={[
                        'absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)]',
                        isAgentOnline
                          ? 'bg-emerald-500'
                          : 'bg-amber-500',
                      ].join(
                        ' ',
                      )}
                    />

                  </div>


                  {/* USER */}

                  <div className="hidden text-left lg:block">

                    <p className="max-w-[120px] truncate text-[11px] font-semibold text-[var(--text)]">

                      {displayName}

                    </p>


                    <p className="max-w-[120px] truncate text-[9px] capitalize text-[var(--muted)]">

                      {displayRole}

                    </p>

                  </div>


                  <ChevronDown
                    size={14}
                    className={[
                      'text-[var(--muted)] transition-transform duration-200',
                      profileOpen
                        ? 'rotate-180'
                        : '',
                    ].join(
                      ' ',
                    )}
                  />

                </button>


                {/* =================================================
                    PROFILE DROPDOWN
                    ================================================= */}

                {profileOpen && (

                  <div className="absolute right-0 top-12 z-50 w-[290px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-slate-900/15">

                    {/* PROFILE HEADER */}

                    <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] p-4">

                      <div className="flex items-center gap-3">

                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--charcoal)] text-sm font-bold text-white shadow-md">

                          {userInitials}


                          <span
                            className={[
                              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface-soft)]',
                              isAgentOnline
                                ? 'bg-emerald-500'
                                : 'bg-amber-500',
                            ].join(
                              ' ',
                            )}
                          />

                        </div>


                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-bold text-[var(--text)]">

                            {displayName}

                          </p>


                          <p className="truncate text-[10px] capitalize text-[var(--muted)]">

                            {displayRole}

                          </p>


                          <div className="mt-1.5 flex items-center gap-1.5">

                            <span
                              className={[
                                'h-1.5 w-1.5 rounded-full',
                                isAgentOnline
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500',
                              ].join(
                                ' ',
                              )}
                            />


                            <span
                              className={[
                                'text-[9px] font-semibold',
                                isAgentOnline
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-amber-600 dark:text-amber-400',
                              ].join(
                                ' ',
                              )}
                            >

                              {agentStatus ===
                              null
                                ? 'Checking agent...'
                                : isAgentOnline
                                  ? 'AI Agent Online'
                                  : 'AI Agent Offline'}

                            </span>

                          </div>

                        </div>

                      </div>

                    </div>


                    {/* =================================================
                        MENU
                        ================================================= */}

                    <div className="p-2">

                      {isAuthenticated ? (

                        <>

                          {/* =================================================
                              ADMIN CONSOLE
                              VISIBLE TO EVERY LOGGED-IN USER
                              ================================================= */}

                          <MenuLink
                            to="/admin"
                            icon={
                              <ShieldCheck
                                size={15}
                              />
                            }
                            title="Admin Console"
                            description="Manage the entire system"
                            onClick={() =>
                              setProfileOpen(
                                false,
                              )
                            }
                          />


                          {/* =================================================
                              USER MANAGEMENT
                              VISIBLE TO LOGGED-IN USERS
                              ================================================= */}

                          <MenuLink
                            to="/admin/users"
                            icon={
                              <Users
                                size={15}
                              />
                            }
                            title="User Management"
                            description="Manage users & roles"
                            onClick={() =>
                              setProfileOpen(
                                false,
                              )
                            }
                          />


                          {/* =================================================
                              AGENT ACTIVITY
                              ================================================= */}

                          <MenuLink
                            to="/agent-activity"
                            icon={
                              <Activity
                                size={15}
                              />
                            }
                            title="Agent Activity"
                            description="Monitor AI operations"
                            onClick={() =>
                              setProfileOpen(
                                false,
                              )
                            }
                          />


                          {/* =================================================
                              SETTINGS
                              ================================================= */}

                          <MenuLink
                            to="/settings"
                            icon={
                              <Settings
                                size={15}
                              />
                            }
                            title="Settings"
                            description="System configuration"
                            onClick={() =>
                              setProfileOpen(
                                false,
                              )
                            }
                          />


                          {/* =================================================
                              SUPPORT TICKETS
                              ================================================= */}

                          <MenuLink
                            to="/tickets"
                            icon={
                              <Ticket
                                size={15}
                              />
                            }
                            title="Support Tickets"
                            description="Manage escalations"
                            onClick={() =>
                              setProfileOpen(
                                false,
                              )
                            }
                          />


                          {/* =================================================
                              LOGOUT
                              ================================================= */}

                          <button
                            type="button"
                            onClick={
                              handleLogout
                            }
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-red-500/10"
                          >

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">

                              <LogOut
                                size={15}
                              />

                            </div>


                            <div className="min-w-0">

                              <p className="text-[11px] font-semibold text-red-500">
                                Logout
                              </p>

                              <p className="text-[9px] text-[var(--muted)]">
                                Sign out of your account
                              </p>

                            </div>

                          </button>

                        </>

                      ) : (

                        <>

                          {/* =================================================
                              ADMIN CONSOLE

                              VISIBLE EVEN WHEN LOGGED OUT
                              The AdminDashboard page itself performs
                              the administrator security check.
                              ================================================= */}

                          <MenuLink
                            to="/admin"
                            icon={
                              <ShieldCheck
                                size={15}
                              />
                            }
                            title="Admin Console"
                            description="System administration"
                            onClick={() =>
                              setProfileOpen(
                                false,
                              )
                            }
                          />


                          {/* =================================================
                              LOGIN
                              ================================================= */}

                          <Link
                            to="/login"
                            onClick={() =>
                              setProfileOpen(
                                false,
                              )
                            }
                            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--surface-soft)]"
                          >

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">

                              <LogIn
                                size={15}
                              />

                            </div>


                            <div className="min-w-0">

                              <p className="text-[11px] font-semibold text-[var(--text)]">
                                Login
                              </p>

                              <p className="text-[9px] text-[var(--muted)]">
                                Sign in to your account
                              </p>

                            </div>

                          </Link>


                          {/* =================================================
                              CREATE ACCOUNT
                              ================================================= */}

                          <Link
                            to="/signup"
                            onClick={() =>
                              setProfileOpen(
                                false,
                              )
                            }
                            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--surface-soft)]"
                          >

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--muted)]">

                              <UserPlus
                                size={15}
                              />

                            </div>


                            <div className="min-w-0">

                              <p className="text-[11px] font-semibold text-[var(--text)]">
                                Create Account
                              </p>

                              <p className="text-[9px] text-[var(--muted)]">
                                Register a support account
                              </p>

                            </div>

                          </Link>

                        </>

                      )}

                    </div>


                    {/* =================================================
                        APPEARANCE
                        ================================================= */}

                    <div className="border-t border-[var(--border)] p-2">

                      <div className="flex items-center justify-between rounded-xl px-3 py-2.5">

                        <div className="flex items-center gap-2.5">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--muted)]">

                            {theme ===
                            'light' ? (

                              <Sun
                                size={15}
                              />

                            ) : (

                              <Moon
                                size={15}
                              />

                            )}

                          </div>


                          <div>

                            <p className="text-[10px] font-bold text-[var(--text)]">
                              Appearance
                            </p>


                            <p className="text-[9px] text-[var(--muted)]">

                              {theme ===
                              'light'
                                ? 'Light mode'
                                : 'Dark mode'}

                            </p>

                          </div>

                        </div>


                        {/* THEME SWITCH */}

                        <button
                          type="button"
                          onClick={
                            toggleTheme
                          }
                          className={[
                            'relative h-6 w-11 rounded-full transition-colors duration-200',
                            theme ===
                            'light'
                              ? 'bg-slate-300'
                              : 'bg-teal-600',
                          ].join(
                            ' ',
                          )}
                          aria-label="Toggle theme"
                        >

                          <span
                            className={[
                              'absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200',
                              theme ===
                              'light'
                                ? 'left-1'
                                : 'left-6',
                            ].join(
                              ' ',
                            )}
                          />

                        </button>

                      </div>

                    </div>


                    {/* =================================================
                        FOOTER
                        ================================================= */}

                    <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">

                      <div className="flex items-center gap-2">

                        <ShieldCheck
                          size={13}
                          className="text-[var(--primary)]"
                        />


                        <p className="text-[9px] leading-4 text-[var(--muted)]">
                          Secure FoodChow support
                          environment
                        </p>

                      </div>

                    </div>

                  </div>

                )}

              </div>


              {/* =================================================
                  MOBILE PROFILE
                  ================================================= */}

              <button
                type="button"
                onClick={() => {

                  setProfileOpen(
                    (current) =>
                      !current,
                  )


                  setNotificationOpen(
                    false,
                  )

                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--charcoal)] text-[10px] font-bold text-white shadow-sm sm:hidden"
                aria-label="Open profile menu"
              >

                {userInitials}


                <span
                  className={[
                    'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)]',
                    isAgentOnline
                      ? 'bg-emerald-500'
                      : 'bg-amber-500',
                  ].join(
                    ' ',
                  )}
                />

              </button>

            </div>

          </div>

        </header>


        {/* =====================================================
            PAGE CONTENT
            ===================================================== */}

        <main className="relative min-h-[calc(100vh-76px)] overflow-hidden">

          <div
            className="pointer-events-none absolute inset-0 z-0 bg-[var(--background)]/20 backdrop-blur-[1px]"
            aria-hidden="true"
          />


          <div
            key={location.pathname}
            className="relative z-10 min-h-[calc(100vh-76px)] foodchow-page-transition"
          >

            {children}

          </div>

        </main>

      </div>

    </div>

  )

}


// ============================================================
// PROFILE MENU LINK
// ============================================================

function MenuLink({
  to,
  icon,
  title,
  description,
  onClick,
}) {

  return (

    <Link
      to={to}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--surface-soft)]"
    >

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--muted)] transition group-hover:bg-[var(--primary-soft)] group-hover:text-[var(--primary)]">

        {icon}

      </div>


      <div className="min-w-0">

        <p className="text-[11px] font-semibold text-[var(--text)]">
          {title}
        </p>


        <p className="text-[9px] text-[var(--muted)]">
          {description}
        </p>

      </div>

    </Link>

  )

}


// ============================================================
// USER INITIALS
// ============================================================

function getInitials(
  name,
) {

  if (!name) {
    return 'G'
  }


  const parts =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)


  if (
    parts.length ===
    1
  ) {

    return parts[0]
      .slice(0, 2)
      .toUpperCase()

  }


  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase()

}


// ============================================================
// FORMAT USER ROLE
// ============================================================

function formatRole(
  role,
) {

  if (!role) {
    return 'Guest'
  }


  return String(role)
    .replace(
      /_/g,
      ' ',
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    )

}


// ============================================================
// AGENT STATUS HELPER
// ============================================================

function getAgentOnlineState(
  status,
) {

  if (!status) {
    return false
  }


  if (
    typeof status ===
    'boolean'
  ) {

    return status

  }


  if (
    typeof status ===
    'string'
  ) {

    const normalized =
      status.toLowerCase()


    return (
      normalized ===
        'online' ||
      normalized ===
        'active' ||
      normalized ===
        'running' ||
      normalized ===
        'healthy'
    )

  }


  if (
    typeof status ===
    'object'
  ) {

    if (
      typeof status.online ===
      'boolean'
    ) {

      return status.online

    }


    if (
      typeof status.is_online ===
      'boolean'
    ) {

      return status.is_online

    }


    const value =
      status.status ||
      status.agent_status ||
      status.state


    if (
      typeof value ===
      'string'
    ) {

      const normalized =
        value.toLowerCase()


      return (
        normalized ===
          'online' ||
        normalized ===
          'active' ||
        normalized ===
          'running' ||
        normalized ===
          'healthy'
      )

    }

  }


  return true

}


// ============================================================
// PAGE TITLE
// ============================================================

function getPageTitle(
  pathname,
) {

  if (
    pathname === '/'
  ) {
    return 'Dashboard'
  }


  if (
    pathname.startsWith(
      '/chat',
    )
  ) {
    return 'AI Chat'
  }


  if (
    pathname ===
    '/conversations'
  ) {
    return 'Conversations'
  }


  if (
    pathname ===
    '/tickets'
  ) {
    return 'Tickets'
  }


  if (
    pathname.startsWith(
      '/tickets/',
    )
  ) {
    return 'Ticket Details'
  }


  if (
    pathname ===
    '/agent-activity'
  ) {
    return 'Agent Activity'
  }


  if (
    pathname ===
    '/knowledge'
  ) {
    return 'Knowledge Base'
  }


  if (
    pathname ===
    '/analytics'
  ) {
    return 'Analytics'
  }


  if (
    pathname ===
    '/settings'
  ) {
    return 'Settings'
  }


  if (
    pathname ===
    '/admin'
  ) {
    return 'Admin Console'
  }


  if (
    pathname.startsWith(
      '/admin/',
    )
  ) {
    return 'Administration'
  }


  return 'Dashboard'

}


export default DashboardLayout