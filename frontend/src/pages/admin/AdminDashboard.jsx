import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  KeyRound,
  ShieldCheck,
  Users,
  UserCheck,
  Settings as SettingsIcon,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const { user } = useAuth();

  const adminSections = [
    {
      title: "Users",
      description: "Manage users, accounts and access.",
      icon: <Users size={22} />,
      path: "/admin/users",
      stat: "24 Users",
    },
    {
      title: "Roles & Permissions",
      description: "Configure roles and permissions.",
      icon: <ShieldCheck size={22} />,
      path: "/admin/roles",
      stat: "3 Roles",
    },
    {
      title: "Approvals",
      description: "Review pending access requests.",
      icon: <UserCheck size={22} />,
      path: "/admin/approvals",
      stat: "6 Pending",
    },
    {
      title: "System Configuration",
      description: "Manage application configuration.",
      icon: <SettingsIcon size={22} />,
      path: "/admin/system",
      stat: "12 Settings",
    },
    {
      title: "Integrations",
      description: "Monitor connected services.",
      icon: <Database size={22} />,
      path: "/admin/integrations",
      stat: "8 Integrations",
    },
    {
      title: "Security & Audit",
      description: "Review security events and activity.",
      icon: <KeyRound size={22} />,
      path: "/admin/security",
      stat: "128 Events",
    },
  ];

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--text)",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header
        className="border-b"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* =================================================
                TITLE AREA
            ================================================== */}
            <div>

              {/* BACK TO MAIN DASHBOARD */}
              <Link
                to="/"
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:gap-3"
                style={{
                  color: "var(--primary)",
                  textDecoration: "none",
                }}
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Link>

              {/* ADMINISTRATOR LABEL */}
              <div
                className="mb-2 flex items-center gap-2 text-sm"
                style={{
                  color: "var(--primary)",
                }}
              >
                <ShieldCheck size={16} />
                Administrator Console
              </div>

              {/* TITLE */}
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  color: "var(--text-strong)",
                }}
              >
                FoodChow Administration
              </h1>

              {/* DESCRIPTION */}
              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--muted)",
                }}
              >
                Manage users, permissions, configuration and system activity.
              </p>
            </div>

            {/* =================================================
                SIGNED-IN USER
            ================================================== */}
            <div
              className="rounded-xl border px-4 py-3"
              style={{
                backgroundColor: "var(--surface-soft)",
                borderColor: "var(--border)",
              }}
            >
              <p
                className="text-xs"
                style={{
                  color: "var(--muted)",
                }}
              >
                Signed in as
              </p>

              <p
                className="mt-1 font-medium"
                style={{
                  color: "var(--text-strong)",
                }}
              >
                {user?.name || user?.email || "User"}
              </p>

              <p
                className="text-xs capitalize"
                style={{
                  color: "var(--muted)",
                }}
              >
                {user?.role || "authenticated user"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* =================================================
            SYSTEM OVERVIEW
        ================================================== */}
        <section>
          <div className="mb-5">
            <h2
              className="text-lg font-semibold"
              style={{
                color: "var(--text-strong)",
              }}
            >
              System Overview
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--muted)",
              }}
            >
              Current FoodChow support platform status.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* TOTAL USERS */}
            <StatCard
              icon={<Users size={20} />}
              status="+12%"
              statusType="success"
              label="Total Users"
              value="24"
            />

            {/* ACTIVE TICKETS */}
            <StatCard
              icon={<Activity size={20} />}
              status="Active"
              statusType="success"
              label="Active Tickets"
              value="18"
            />

            {/* PENDING APPROVALS */}
            <StatCard
              icon={<Clock3 size={20} />}
              status="Review"
              statusType="warning"
              label="Pending Approvals"
              value="6"
            />

            {/* SYSTEM STATUS */}
            <StatCard
              icon={<CheckCircle2 size={20} />}
              status="Healthy"
              statusType="success"
              label="System Status"
              value="99.9%"
            />
          </div>
        </section>

        {/* =================================================
            ADMINISTRATION
        ================================================== */}
        <section className="mt-10">

          <div className="mb-5">
            <h2
              className="text-lg font-semibold"
              style={{
                color: "var(--text-strong)",
              }}
            >
              Administration
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--muted)",
              }}
            >
              Access and manage FoodChow platform administration tools.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {adminSections.map((section) => (
              <Link
                key={section.title}
                to={section.path}
                className="foodchow-card group relative block p-6"
                style={{
                  textDecoration: "none",
                }}
              >

                {/* ICON + ARROW */}
                <div className="flex items-start justify-between">

                  <div
                    className="rounded-xl p-3"
                    style={{
                      backgroundColor: "var(--primary-soft)",
                      color: "var(--primary)",
                    }}
                  >
                    {section.icon}
                  </div>

                  <ArrowRight
                    size={18}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    style={{
                      color: "var(--muted-light)",
                    }}
                  />
                </div>

                {/* TITLE */}
                <h3
                  className="mt-5 text-base font-semibold"
                  style={{
                    color: "var(--text-strong)",
                  }}
                >
                  {section.title}
                </h3>

                {/* DESCRIPTION */}
                <p
                  className="mt-2 min-h-[40px] text-sm leading-5"
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  {section.description}
                </p>

                {/* STAT */}
                <div
                  className="mt-5 border-t pt-4"
                  style={{
                    borderColor: "var(--border)",
                  }}
                >
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "var(--secondary)",
                    }}
                  >
                    {section.stat}
                  </span>
                </div>

              </Link>
            ))}

          </div>
        </section>

        {/* =================================================
            SECURITY NOTICE
        ================================================== */}
        <section className="mt-10">

          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: "var(--warning-soft)",
              borderColor: "rgba(217, 119, 6, 0.25)",
            }}
          >

            <div className="flex gap-4">

              {/* ICON */}
              <div
                className="mt-0.5 rounded-lg p-2"
                style={{
                  backgroundColor: "rgba(217, 119, 6, 0.10)",
                  color: "var(--warning)",
                }}
              >
                <ShieldCheck size={18} />
              </div>

              {/* CONTENT */}
              <div>

                <h3
                  className="font-semibold"
                  style={{
                    color: "var(--text-strong)",
                  }}
                >
                  Security & Access
                </h3>

                <p
                  className="mt-1 text-sm leading-6"
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  Authentication and role-based access controls are enabled
                  for the FoodChow support platform. Administrative tools are
                  available from this console for demonstration and system
                  management.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  status,
  statusType,
  label,
  value,
}) {
  const statusColor =
    statusType === "warning"
      ? "var(--warning)"
      : "var(--success)";

  return (
    <div className="foodchow-card p-5">

      <div className="flex items-start justify-between">

        {/* ICON */}
        <div
          className="rounded-xl p-3"
          style={{
            backgroundColor: "var(--primary-soft)",
            color: "var(--primary)",
          }}
        >
          {icon}
        </div>

        {/* STATUS */}
        <span
          className="text-xs font-medium"
          style={{
            color: statusColor,
          }}
        >
          {status}
        </span>

      </div>

      {/* LABEL */}
      <p
        className="mt-5 text-sm"
        style={{
          color: "var(--muted)",
        }}
      >
        {label}
      </p>

      {/* VALUE */}
      <p
        className="mt-1 text-3xl font-bold"
        style={{
          color: "var(--text-strong)",
        }}
      >
        {value}
      </p>

    </div>
  );
}


export default AdminDashboard;