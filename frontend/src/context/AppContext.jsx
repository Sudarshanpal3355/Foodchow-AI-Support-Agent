import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'


const AppContext =
  createContext(null)


const THEME_STORAGE_KEY =
  'foodchow-theme'


const SIDEBAR_STORAGE_KEY =
  'foodchow-sidebar'


export function AppProvider({
  children,
}) {

  const [
    theme,
    setTheme,
  ] = useState(() => {

    const savedTheme =
      localStorage.getItem(
        THEME_STORAGE_KEY,
      )


    if (
      savedTheme === 'dark' ||
      savedTheme === 'light'
    ) {

      return savedTheme

    }


    /*
     * Default theme is always LIGHT.
     *
     * We intentionally do not use the
     * system/browser dark-mode preference.
     */

    return 'light'

  })


  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(() => {

    const saved =
      localStorage.getItem(
        SIDEBAR_STORAGE_KEY,
      )


    return saved === 'true'

  })


  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false)


  /* ==========================================================
     APPLY THEME
     ========================================================== */

  useEffect(() => {

    const root =
      document.documentElement


    root.dataset.theme =
      theme


    root.classList.toggle(
      'dark',
      theme === 'dark',
    )


    localStorage.setItem(
      THEME_STORAGE_KEY,
      theme,
    )

  }, [
    theme,
  ])


  /* ==========================================================
     SAVE SIDEBAR STATE
     ========================================================== */

  useEffect(() => {

    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(sidebarCollapsed),
    )

  }, [
    sidebarCollapsed,
  ])


  /* ==========================================================
     THEME ACTIONS
     ========================================================== */

  function toggleTheme() {

    setTheme(
      (currentTheme) =>
        currentTheme === 'light'
          ? 'dark'
          : 'light',
    )

  }


  function setLightTheme() {

    setTheme('light')

  }


  function setDarkTheme() {

    setTheme('dark')

  }


  /* ==========================================================
     SIDEBAR ACTIONS
     ========================================================== */

  function toggleSidebar() {

    setSidebarCollapsed(
      (current) => !current,
    )

  }


  function expandSidebar() {

    setSidebarCollapsed(false)

  }


  function collapseSidebar() {

    setSidebarCollapsed(true)

  }


  function openMobileSidebar() {

    setMobileSidebarOpen(true)

  }


  function closeMobileSidebar() {

    setMobileSidebarOpen(false)

  }


  function toggleMobileSidebar() {

    setMobileSidebarOpen(
      (current) => !current,
    )

  }


  function handleMobileNavigation() {

    if (
      window.innerWidth < 1024
    ) {

      setMobileSidebarOpen(false)

    }

  }


  /* ==========================================================
     RESPONSIVE
     ========================================================== */

  useEffect(() => {

    function handleResize() {

      if (
        window.innerWidth >= 1024
      ) {

        setMobileSidebarOpen(false)

      }

    }


    handleResize()


    window.addEventListener(
      'resize',
      handleResize,
    )


    return () => {

      window.removeEventListener(
        'resize',
        handleResize,
      )

    }

  }, [])


  const value = {

    theme,

    setTheme,

    toggleTheme,

    setLightTheme,

    setDarkTheme,

    sidebarCollapsed,

    setSidebarCollapsed,

    toggleSidebar,

    expandSidebar,

    collapseSidebar,

    mobileSidebarOpen,

    setMobileSidebarOpen,

    openMobileSidebar,

    closeMobileSidebar,

    toggleMobileSidebar,

    handleMobileNavigation,

  }


  return (

    <AppContext.Provider
      value={value}
    >

      {children}

    </AppContext.Provider>

  )

}


export function useApp() {

  const context =
    useContext(AppContext)


  if (!context) {

    throw new Error(
      'useApp must be used inside AppProvider',
    )

  }


  return context

}


export default AppContext