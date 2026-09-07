import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import { useAuth } from "./context/AuthContext";

import DashboardLayout from "./layouts/DashboardLayout";

// ============================================================
// MAIN PAGES
// ============================================================

import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Conversations from "./pages/Conversations";
import Tickets from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";
import AgentActivity from "./pages/AgentActivity";
import Knowledge from "./pages/Knowledge";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

// ============================================================
// AUTHENTICATION
// ============================================================

import Login from "./pages/Login";
import Signup from "./pages/Signup";

// ============================================================
// ADMIN
// ============================================================

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import AdminSecurity from "./pages/admin/AdminSecurity";

// ============================================================
// DASHBOARD ROUTE LAYOUT
// ============================================================

function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

function AdminRoutes() {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <div className="min-h-screen grid place-items-center">Checking access...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  return <Outlet />;
}


// ============================================================
// APPLICATION
// ============================================================

function App() {
  return (
    <AppProvider>
      <BrowserRouter>

        <Routes>

          {/* ==================================================
              LOGIN
              ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ==================================================
              SIGNUP
              ================================================== */}

          <Route
            path="/signup"
            element={<Signup />}
          />


          {/* ==================================================
              MAIN APPLICATION

              NO LOGIN REQUIRED
              ================================================== */}

          <Route element={<DashboardRoutes />}>

            {/* DASHBOARD */}

            <Route
              path="/"
              element={<Dashboard />}
            />


            {/* AI SUPPORT CHAT */}

            <Route
              path="/chat"
              element={<Chat />}
            />


            {/* CONVERSATIONS */}

            <Route
              path="/conversations"
              element={<Conversations />}
            />


            {/* TICKETS */}

            <Route
              path="/tickets"
              element={<Tickets />}
            />


            {/* TICKET DETAILS */}

            <Route
              path="/tickets/:ticketId"
              element={<TicketDetails />}
            />


            {/* AGENT ACTIVITY */}

            <Route
              path="/agent-activity"
              element={<AgentActivity />}
            />


            {/* KNOWLEDGE BASE */}

            <Route
              path="/knowledge"
              element={<Knowledge />}
            />


            {/* ANALYTICS */}

            <Route
              path="/analytics"
              element={<Analytics />}
            />


            {/* SETTINGS */}

            <Route
              path="/settings"
              element={<Settings />}
            />

          </Route>


          {/* ==================================================
              ADMIN CONSOLE
              ================================================== */}

          <Route element={<AdminRoutes />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/approvals" element={<AdminApprovals />} />
            <Route path="/admin/system" element={<AdminSystem />} />
            <Route path="/admin/integrations" element={<AdminIntegrations />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
          </Route>


          {/* ==================================================
              UNKNOWN ROUTES
              ================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>
    </AppProvider>
  );
}


// ============================================================
// EXPORT
// ============================================================

export default App;