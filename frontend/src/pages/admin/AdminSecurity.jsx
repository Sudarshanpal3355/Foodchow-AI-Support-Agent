import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Filter,
  KeyRound,
  Loader2,
  LogIn,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";

import { getAuditLogs } from "../../services/adminApi";

function AdminSecurity() {
  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] =
    useState("all");
  const [typeFilter, setTypeFilter] =
    useState("all");

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD REAL AUDIT LOGS
  // ============================================================

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (severityFilter !== "all") {
        params.severity = severityFilter;
      }

      const data = await getAuditLogs(params);

      const normalizedEvents = (
        data.events || []
      ).map(normalizeAuditEvent);

      setEvents(normalizedEvents);
    } catch (err) {
      console.error(
        "Failed to load audit logs:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load audit logs from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [search, severityFilter]);

  // ============================================================
  // NORMALIZE BACKEND EVENT
  // ============================================================

  const normalizedFilteredEvents =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return events.filter((event) => {
        const matchesSearch =
          !query ||
          event.action
            .toLowerCase()
            .includes(query) ||
          event.description
            .toLowerCase()
            .includes(query) ||
          event.user
            .toLowerCase()
            .includes(query) ||
          event.email
            .toLowerCase()
            .includes(query) ||
          event.id
            .toLowerCase()
            .includes(query) ||
          event.ip
            .toLowerCase()
            .includes(query);

        const matchesType =
          typeFilter === "all" ||
          event.type === typeFilter;

        return (
          matchesSearch &&
          matchesType
        );
      });
    }, [
      events,
      search,
      typeFilter,
    ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalEvents = events.length;

  const securityEvents = events.filter(
    (event) =>
      event.type === "security"
  ).length;

  const highSeverity = events.filter(
    (event) =>
      event.severity === "high"
  ).length;

  const successfulEvents = events.filter(
    (event) =>
      event.status === "success"
  ).length;

  // ============================================================
  // EXPORT LOG
  // ============================================================

  const exportAuditLog = () => {
    if (!events.length) {
      window.alert(
        "There are no audit events to export."
      );

      return;
    }

    const headers = [
      "Event ID",
      "Action",
      "User",
      "Email",
      "Severity",
      "Resource",
      "Resource ID",
      "Time",
    ];

    const rows = events.map(
      (event) => [
        event.id,
        event.action,
        event.user,
        event.email,
        event.severity,
        event.resource,
        event.resourceId || "",
        event.time,
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `foodchow-audit-log-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor:
          "var(--background)",
        color: "var(--text)",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header
        className="border-b"
        style={{
          backgroundColor:
            "var(--surface)",
          borderColor:
            "var(--border)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            to="/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:gap-3"
            style={{
              color:
                "var(--primary)",
              textDecoration:
                "none",
            }}
          >
            <ArrowLeft size={16} />
            Back to Admin Console
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div
                className="mb-2 flex items-center gap-2 text-sm"
                style={{
                  color:
                    "var(--primary)",
                }}
              >
                <ShieldCheck size={16} />
                Administration
              </div>

              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  color:
                    "var(--text-strong)",
                }}
              >
                Security & Audit
              </h1>

              <p
                className="mt-1 text-sm"
                style={{
                  color:
                    "var(--muted)",
                }}
              >
                Monitor authentication,
                administration and system
                activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={
                  exportAuditLog
                }
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
                style={{
                  backgroundColor:
                    "var(--surface)",
                  borderColor:
                    "var(--border)",
                  color:
                    "var(--text)",
                  cursor:
                    "pointer",
                }}
              >
                <Download size={16} />
                Export Log
              </button>

              <button
                type="button"
                onClick={
                  loadAuditLogs
                }
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{
                  backgroundColor:
                    "var(--primary)",
                  color:
                    "#ffffff",
                  border: "none",
                  cursor:
                    "pointer",
                  opacity:
                    loading ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <ShieldCheck
                    size={16}
                  />
                )}

                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="mb-6 flex items-start gap-3 rounded-xl border p-4"
            style={{
              backgroundColor:
                "var(--danger-soft)",
              borderColor:
                "var(--border)",
              color:
                "var(--danger)",
            }}
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p className="flex-1 text-sm font-medium">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1"
              style={{
                border: "none",
                backgroundColor:
                  "transparent",
                color:
                  "var(--danger)",
                cursor:
                  "pointer",
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={
              <ShieldCheck size={20} />
            }
            label="Audit Events"
            value={totalEvents}
            type="primary"
          />

          <SummaryCard
            icon={
              <ShieldAlert size={20} />
            }
            label="Security Events"
            value={securityEvents}
            type="warning"
          />

          <SummaryCard
            icon={
              <AlertCircle size={20} />
            }
            label="High Severity"
            value={highSeverity}
            type="danger"
          />

          <SummaryCard
            icon={
              <CheckCircle2 size={20} />
            }
            label="Successful Events"
            value={successfulEvents}
            type="success"
          />
        </section>

        {/* ====================================================
            SECURITY OVERVIEW
        ==================================================== */}

        <section className="mt-8">
          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor:
                highSeverity > 0
                  ? "var(--warning-soft)"
                  : "var(--success-soft)",
              borderColor:
                highSeverity > 0
                  ? "rgba(217, 119, 6, 0.25)"
                  : "rgba(22, 163, 74, 0.20)",
            }}
          >
            <div className="flex gap-4">
              <div
                className="rounded-xl p-3"
                style={{
                  backgroundColor:
                    "var(--surface)",
                  color:
                    highSeverity > 0
                      ? "var(--warning)"
                      : "var(--success)",
                }}
              >
                {highSeverity > 0 ? (
                  <ShieldAlert
                    size={21}
                  />
                ) : (
                  <ShieldCheck
                    size={21}
                  />
                )}
              </div>

              <div>
                <h2
                  className="font-semibold"
                  style={{
                    color:
                      "var(--text-strong)",
                  }}
                >
                  {highSeverity > 0
                    ? "Security events detected"
                    : "Security status healthy"}
                </h2>

                <p
                  className="mt-1 text-sm leading-6"
                  style={{
                    color:
                      "var(--muted)",
                  }}
                >
                  {highSeverity > 0
                    ? `${highSeverity} high-severity event${
                        highSeverity !==
                        1
                          ? "s"
                          : ""
                      } require attention in the current audit view.`
                    : "No high-severity events are currently present."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            AUDIT TABLE
        ==================================================== */}

        <section className="mt-8">
          <div className="foodchow-card overflow-hidden">
            <div
              className="border-b px-5 py-5"
              style={{
                borderColor:
                  "var(--border)",
              }}
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{
                      color:
                        "var(--text-strong)",
                    }}
                  >
                    Audit Activity
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color:
                        "var(--muted)",
                    }}
                  >
                    Review important
                    platform events and
                    security activity.
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                  {/* SEARCH */}

                  <div className="relative flex-1">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{
                        color:
                          "var(--muted)",
                      }}
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(
                        event
                      ) =>
                        setSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Search audit events..."
                      className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none"
                      style={{
                        backgroundColor:
                          "var(--surface-soft)",
                        borderColor:
                          "var(--border)",
                        color:
                          "var(--text)",
                      }}
                    />
                  </div>

                  {/* TYPE */}

                  <div className="relative">
                    <Filter
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{
                        color:
                          "var(--muted)",
                      }}
                    />

                    <select
                      value={typeFilter}
                      onChange={(
                        event
                      ) =>
                        setTypeFilter(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-xl border py-2.5 pl-9 pr-8 text-sm outline-none lg:w-48"
                      style={{
                        backgroundColor:
                          "var(--surface-soft)",
                        borderColor:
                          "var(--border)",
                        color:
                          "var(--text)",
                      }}
                    >
                      <option value="all">
                        All Event Types
                      </option>

                      <option value="login">
                        Authentication
                      </option>

                      <option value="security">
                        Security
                      </option>

                      <option value="role">
                        Role Changes
                      </option>

                      <option value="user">
                        User Management
                      </option>

                      <option value="ticket">
                        Tickets
                      </option>

                      <option value="configuration">
                        Configuration
                      </option>
                    </select>
                  </div>

                  {/* SEVERITY */}

                  <select
                    value={
                      severityFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setSeverityFilter(
                        event.target
                          .value
                      )
                    }
                    className="rounded-xl border px-3 py-2.5 text-sm outline-none lg:w-40"
                    style={{
                      backgroundColor:
                        "var(--surface-soft)",
                      borderColor:
                        "var(--border)",
                      color:
                        "var(--text)",
                    }}
                  >
                    <option value="all">
                      All Severity
                    </option>

                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* ==================================================
                LOADING
            ================================================== */}

            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={32}
                    className="mx-auto animate-spin"
                    style={{
                      color:
                        "var(--primary)",
                    }}
                  />

                  <p
                    className="mt-3 text-sm"
                    style={{
                      color:
                        "var(--muted)",
                    }}
                  >
                    Loading audit activity...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* DESKTOP */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[1000px]">
                    <thead
                      style={{
                        backgroundColor:
                          "var(--surface-soft)",
                      }}
                    >
                      <tr>
                        <TableHeading>
                          Event
                        </TableHeading>

                        <TableHeading>
                          User
                        </TableHeading>

                        <TableHeading>
                          Severity
                        </TableHeading>

                        <TableHeading>
                          Resource
                        </TableHeading>

                        <TableHeading>
                          Time
                        </TableHeading>

                        <TableHeading>
                          Action
                        </TableHeading>
                      </tr>
                    </thead>

                    <tbody>
                      {normalizedFilteredEvents.map(
                        (event) => (
                          <tr
                            key={
                              event.id
                            }
                            className="border-t"
                            style={{
                              borderColor:
                                "var(--border)",
                            }}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <EventIcon
                                  type={
                                    event.type
                                  }
                                />

                                <div>
                                  <p
                                    className="font-medium"
                                    style={{
                                      color:
                                        "var(--text-strong)",
                                    }}
                                  >
                                    {
                                      event.action
                                    }
                                  </p>

                                  <p
                                    className="mt-0.5 text-xs"
                                    style={{
                                      color:
                                        "var(--muted)",
                                    }}
                                  >
                                    {
                                      event.id
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p
                                className="text-sm font-medium"
                                style={{
                                  color:
                                    "var(--text-strong)",
                                }}
                              >
                                {
                                  event.user
                                }
                              </p>

                              <p
                                className="mt-0.5 text-xs"
                                style={{
                                  color:
                                    "var(--muted)",
                                }}
                              >
                                {
                                  event.email
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <SeverityBadge
                                severity={
                                  event.severity
                                }
                              />
                            </td>

                            <td className="px-5 py-4">
                              <p
                                className="text-sm font-medium"
                                style={{
                                  color:
                                    "var(--text-strong)",
                                }}
                              >
                                {
                                  event.resource
                                }
                              </p>

                              {event.resourceId && (
                                <p
                                  className="mt-0.5 text-xs"
                                  style={{
                                    color:
                                      "var(--muted)",
                                  }}
                                >
                                  {
                                    event.resourceId
                                  }
                                </p>
                              )}
                            </td>

                            <td
                              className="px-5 py-4 text-sm"
                              style={{
                                color:
                                  "var(--muted)",
                              }}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3
                                  size={14}
                                />

                                {
                                  event.time
                                }
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedEvent(
                                    event
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
                                style={{
                                  backgroundColor:
                                    "var(--surface)",
                                  borderColor:
                                    "var(--border)",
                                  color:
                                    "var(--text)",
                                  cursor:
                                    "pointer",
                                }}
                              >
                                <Eye
                                  size={
                                    14
                                  }
                                />
                                View
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}

                <div className="divide-y md:hidden">
                  {normalizedFilteredEvents.map(
                    (event) => (
                      <div
                        key={
                          event.id
                        }
                        className="p-5"
                        style={{
                          borderColor:
                            "var(--border)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <EventIcon
                            type={
                              event.type
                            }
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p
                                  className="font-medium"
                                  style={{
                                    color:
                                      "var(--text-strong)",
                                  }}
                                >
                                  {
                                    event.action
                                  }
                                </p>

                                <p
                                  className="mt-0.5 text-xs"
                                  style={{
                                    color:
                                      "var(--muted)",
                                  }}
                                >
                                  {
                                    event.id
                                  }
                                </p>
                              </div>

                              <SeverityBadge
                                severity={
                                  event.severity
                                }
                              />
                            </div>

                            <p
                              className="mt-3 text-sm"
                              style={{
                                color:
                                  "var(--muted)",
                              }}
                            >
                              {
                                event.description
                              }
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              <span
                                className="rounded-full border px-2.5 py-1"
                                style={{
                                  borderColor:
                                    "var(--border)",
                                  color:
                                    "var(--muted)",
                                }}
                              >
                                {
                                  event.user
                                }
                              </span>

                              <span
                                className="rounded-full border px-2.5 py-1"
                                style={{
                                  borderColor:
                                    "var(--border)",
                                  color:
                                    "var(--muted)",
                                }}
                              >
                                {
                                  event.resource
                                }
                              </span>

                              <span
                                className="rounded-full border px-2.5 py-1"
                                style={{
                                  borderColor:
                                    "var(--border)",
                                  color:
                                    "var(--muted)",
                                }}
                              >
                                {
                                  event.time
                                }
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedEvent(
                                  event
                                )
                              }
                              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
                              style={{
                                backgroundColor:
                                  "var(--surface)",
                                borderColor:
                                  "var(--border)",
                                color:
                                  "var(--text)",
                              }}
                            >
                              <Eye
                                size={14}
                              />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {normalizedFilteredEvents.length ===
                  0 && (
                  <div className="px-6 py-16 text-center">
                    <CheckCircle2
                      size={34}
                      className="mx-auto"
                      style={{
                        color:
                          "var(--success)",
                      }}
                    />

                    <p
                      className="mt-3 font-medium"
                      style={{
                        color:
                          "var(--text-strong)",
                      }}
                    >
                      No audit events found
                    </p>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color:
                          "var(--muted)",
                      }}
                    >
                      Audit events will appear
                      here when users perform
                      important actions.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ====================================================
            SECURITY CONTROLS
        ==================================================== */}

        <section className="mt-8">
          <div className="mb-4">
            <h2
              className="text-base font-semibold"
              style={{
                color:
                  "var(--text-strong)",
              }}
            >
              Security Controls
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color:
                  "var(--muted)",
              }}
            >
              Current security protections
              for the platform.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SecurityControl
              icon={<LogIn size={19} />}
              title="Authentication"
              value="JWT Enabled"
              description="Authenticated API requests use signed access tokens."
            />

            <SecurityControl
              icon={
                <KeyRound size={19} />
              }
              title="Password Security"
              value="bcrypt"
              description="User passwords are stored as secure password hashes."
            />

            <SecurityControl
              icon={
                <ShieldCheck size={19} />
              }
              title="Audit Logging"
              value="MongoDB"
              description="Important administration events are persisted in the database."
            />
          </div>
        </section>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
            style={{
              backgroundColor:
                "var(--surface)",
              borderColor:
                "var(--border)",
              color:
                "var(--text)",
              textDecoration:
                "none",
            }}
          >
            <ArrowLeft size={16} />
            Admin Console
          </Link>

          <Link
            to="/admin/system"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{
              backgroundColor:
                "var(--primary-soft)",
              color:
                "var(--primary)",
              textDecoration:
                "none",
            }}
          >
            System Configuration
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      {/* ======================================================
          AUDIT EVENT MODAL
      ====================================================== */}

      {selectedEvent && (
        <AuditEventModal
          event={selectedEvent}
          onClose={() =>
            setSelectedEvent(null)
          }
        />
      )}
    </div>
  );
}

/* ============================================================
   NORMALIZE AUDIT EVENT
============================================================ */

function normalizeAuditEvent(event) {
  const action =
    event.action || "System Activity";

  const type = getEventType(
    event.action,
    event.resource
  );

  const description =
    getEventDescription(event);

  const severity =
    event.severity || "low";

  const createdAt =
    event.created_at;

  return {
    id:
      event.id ||
      `AUD-${Date.now()}`,

    type,

    action:
      formatAction(action),

    description,

    user:
      event.user_email ||
      "System",

    email:
      event.user_email ||
      "system@foodchow.com",

    severity,

    resource:
      event.resource ||
      "System",

    resourceId:
      event.resource_id ||
      null,

    ip:
      event.details?.ip ||
      "—",

    time:
      formatDate(createdAt),

    status:
      severity === "high"
        ? "warning"
        : "success",

    details:
      event.details || {},
  };
}

/* ============================================================
   EVENT TYPE
============================================================ */

function getEventType(
  action = "",
  resource = ""
) {
  const value =
    `${action} ${resource}`.toLowerCase();

  if (
    value.includes("login") ||
    value.includes("authentication")
  ) {
    return "login";
  }

  if (
    value.includes("security") ||
    value.includes("delete")
  ) {
    return "security";
  }

  if (
    value.includes("role") ||
    value.includes("permission")
  ) {
    return "role";
  }

  if (
    value.includes("user")
  ) {
    return "user";
  }

  if (
    value.includes("ticket")
  ) {
    return "ticket";
  }

  if (
    value.includes("setting") ||
    value.includes("configuration")
  ) {
    return "configuration";
  }

  return "security";
}

/* ============================================================
   DESCRIPTION
============================================================ */

function getEventDescription(event) {
  const action =
    formatAction(
      event.action || ""
    );

  if (
    event.details &&
    Object.keys(event.details)
      .length > 0
  ) {
    return `${action} was performed on ${event.resource || "system"}.`;
  }

  return `${action} was recorded in the FoodChow audit log.`;
}

/* ============================================================
   FORMAT ACTION
============================================================ */

function formatAction(action) {
  if (!action) {
    return "System Activity";
  }

  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon,
  label,
  value,
  type,
}) {
  const color =
    type === "warning"
      ? "var(--warning)"
      : type === "danger"
        ? "var(--danger)"
        : type === "success"
          ? "var(--success)"
          : "var(--primary)";

  const background =
    type === "warning"
      ? "var(--warning-soft)"
      : type === "danger"
        ? "var(--danger-soft)"
        : type === "success"
          ? "var(--success-soft)"
          : "var(--primary-soft)";

  return (
    <div className="foodchow-card p-5">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          backgroundColor:
            background,
          color,
        }}
      >
        {icon}
      </div>

      <p
        className="mt-5 text-sm"
        style={{
          color:
            "var(--muted)",
        }}
      >
        {label}
      </p>

      <p
        className="mt-1 text-3xl font-bold"
        style={{
          color:
            "var(--text-strong)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   TABLE HEADING
============================================================ */

function TableHeading({ children }) {
  return (
    <th
      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
      style={{
        color:
          "var(--muted)",
      }}
    >
      {children}
    </th>
  );
}

/* ============================================================
   EVENT ICON
============================================================ */

function EventIcon({ type }) {
  const icons = {
    login: (
      <LogIn size={18} />
    ),

    security: (
      <ShieldAlert
        size={18}
      />
    ),

    role: (
      <UserCog size={18} />
    ),

    user: (
      <Users size={18} />
    ),

    ticket: (
      <CheckCircle2
        size={18}
      />
    ),

    configuration: (
      <KeyRound size={18} />
    ),
  };

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
      style={{
        backgroundColor:
          "var(--primary-soft)",
        color:
          "var(--primary)",
      }}
    >
      {icons[type] || (
        <ShieldCheck size={18} />
      )}
    </div>
  );
}

/* ============================================================
   SEVERITY BADGE
============================================================ */

function SeverityBadge({
  severity,
}) {
  const config = {
    low: {
      label: "Low",
      color:
        "var(--success)",
      background:
        "var(--success-soft)",
    },

    medium: {
      label: "Medium",
      color:
        "var(--warning)",
      background:
        "var(--warning-soft)",
    },

    high: {
      label: "High",
      color:
        "var(--danger)",
      background:
        "var(--danger-soft)",
    },
  };

  const current =
    config[severity] ||
    config.low;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor:
          current.background,
        borderColor:
          "var(--border)",
        color:
          current.color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor:
            current.color,
        }}
      />

      {current.label}
    </span>
  );
}

/* ============================================================
   SECURITY CONTROL
============================================================ */

function SecurityControl({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="foodchow-card p-5">
      <div className="flex items-start gap-3">
        <div
          className="rounded-xl p-3"
          style={{
            backgroundColor:
              "var(--primary-soft)",
            color:
              "var(--primary)",
          }}
        >
          {icon}
        </div>

        <div>
          <p
            className="text-sm font-semibold"
            style={{
              color:
                "var(--text-strong)",
            }}
          >
            {title}
          </p>

          <p
            className="mt-1 text-sm font-bold"
            style={{
              color:
                "var(--success)",
            }}
          >
            {value}
          </p>
        </div>
      </div>

      <p
        className="mt-4 text-xs leading-5"
        style={{
          color:
            "var(--muted)",
        }}
      >
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   AUDIT MODAL
============================================================ */

function AuditEventModal({
  event,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor:
          "rgba(0, 0, 0, 0.45)",
      }}
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
        style={{
          backgroundColor:
            "var(--surface)",
          borderColor:
            "var(--border)",
        }}
        onMouseDown={(
          clickEvent
        ) =>
          clickEvent.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <EventIcon
              type={event.type}
            />

            <div>
              <h2
                className="text-lg font-semibold"
                style={{
                  color:
                    "var(--text-strong)",
                }}
              >
                {event.action}
              </h2>

              <p
                className="mt-0.5 text-xs"
                style={{
                  color:
                    "var(--muted)",
                }}
              >
                {event.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2"
            style={{
              backgroundColor:
                "var(--surface-soft)",
              color:
                "var(--muted)",
              border: "none",
              cursor:
                "pointer",
            }}
          >
            <X size={17} />
          </button>
        </div>

        <p
          className="mt-6 rounded-xl border p-4 text-sm leading-6"
          style={{
            backgroundColor:
              "var(--surface-soft)",
            borderColor:
              "var(--border)",
            color:
              "var(--muted)",
          }}
        >
          {event.description}
        </p>

        <div className="mt-5 space-y-4">
          <InfoRow
            label="User"
            value={event.user}
          />

          <InfoRow
            label="Email"
            value={event.email}
          />

          <InfoRow
            label="Severity"
            value={
              <SeverityBadge
                severity={
                  event.severity
                }
              />
            }
          />

          <InfoRow
            label="Resource"
            value={
              event.resource
            }
          />

          {event.resourceId && (
            <InfoRow
              label="Resource ID"
              value={
                event.resourceId
              }
            />
          )}

          <InfoRow
            label="IP Address"
            value={event.ip}
          />

          <InfoRow
            label="Time"
            value={event.time}
          />
        </div>

        {event.details &&
          Object.keys(
            event.details
          ).length > 0 && (
            <div className="mt-5">
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-wide"
                style={{
                  color:
                    "var(--muted)",
                }}
              >
                Event Details
              </p>

              <pre
                className="max-h-40 overflow-auto rounded-xl border p-4 text-xs"
                style={{
                  backgroundColor:
                    "var(--surface-soft)",
                  borderColor:
                    "var(--border)",
                  color:
                    "var(--text)",
                }}
              >
                {JSON.stringify(
                  event.details,
                  null,
                  2
                )}
              </pre>
            </div>
          )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{
            backgroundColor:
              "var(--primary)",
            color: "#ffffff",
            border: "none",
            cursor:
              "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
}) {
  return (
    <div
      className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between"
      style={{
        borderColor:
          "var(--border)",
      }}
    >
      <span
        className="text-xs font-medium"
        style={{
          color:
            "var(--muted)",
        }}
      >
        {label}
      </span>

      <span
        className="text-sm font-medium sm:text-right"
        style={{
          color:
            "var(--text-strong)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default AdminSecurity;