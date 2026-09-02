import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  Globe,
  KeyRound,
  Link2,
  Loader2,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  Wifi,
  XCircle,
} from "lucide-react";

import {
  checkIntegration as checkIntegrationApi,
  checkAllIntegrations,
} from "../../services/adminApi";

const INITIAL_INTEGRATIONS = [
  {
    id: "mongodb",
    name: "MongoDB",
    description:
      "Primary database for FoodChow support data.",
    category: "Database",
    status: "connected",
    latency: "—",
    lastChecked: "Not checked",
    icon: <Database size={21} />,
  },
  {
    id: "ai",
    name: "AI Support Engine",
    description:
      "AI service powering classification and support responses.",
    category: "AI Service",
    status: "connected",
    latency: "—",
    lastChecked: "Not checked",
    icon: <Activity size={21} />,
  },
  {
    id: "pos",
    name: "POS API",
    description:
      "Restaurant point-of-sale integration.",
    category: "Restaurant",
    status: "connected",
    latency: "—",
    lastChecked: "Not checked",
    icon: <Server size={21} />,
  },
  {
    id: "kds",
    name: "KDS API",
    description:
      "Kitchen display system diagnostics and status.",
    category: "Restaurant",
    status: "connected",
    latency: "—",
    lastChecked: "Not checked",
    icon: <Wifi size={21} />,
  },
  {
    id: "payments",
    name: "Payments API",
    description:
      "Payment status and transaction verification.",
    category: "Payments",
    status: "connected",
    latency: "—",
    lastChecked: "Not checked",
    icon: <ShieldCheck size={21} />,
  },
  {
    id: "notifications",
    name: "Notification Service",
    description:
      "Email and application notification delivery.",
    category: "Notifications",
    status: "connected",
    latency: "—",
    lastChecked: "Not checked",
    icon: <Globe size={21} />,
  },
  {
    id: "tickets",
    name: "Support Ticket API",
    description:
      "Creates and updates customer support tickets.",
    category: "Support",
    status: "connected",
    latency: "—",
    lastChecked: "Not checked",
    icon: <Link2 size={21} />,
  },
  {
    id: "knowledge",
    name: "Knowledge Base",
    description:
      "Retrieval source for support documentation.",
    category: "Knowledge",
    status: "warning",
    latency: "—",
    lastChecked: "Not checked",
    icon: <KeyRound size={21} />,
  },
];

function AdminIntegrations() {
  const [integrations, setIntegrations] =
    useState(INITIAL_INTEGRATIONS);

  const [checking, setChecking] =
    useState(null);

  const [selectedIntegration, setSelectedIntegration] =
    useState(null);

  const [error, setError] =
    useState("");

  // ============================================================
  // CHECK ONE INTEGRATION
  // ============================================================

  const handleCheckIntegration = async (id) => {
    try {
      setChecking(id);
      setError("");

      const response =
        await checkIntegrationApi(id);

      const result =
        response?.integration ||
        response;

      const normalized =
        normalizeIntegrationResult(
          result
        );

      setIntegrations(
        (current) =>
          current.map(
            (integration) =>
              integration.id === id
                ? {
                    ...integration,
                    ...normalized,
                    lastChecked:
                      "Just now",
                  }
                : integration
          )
      );
    } catch (err) {
      console.error(
        `Failed to check integration ${id}:`,
        err
      );

      setIntegrations(
        (current) =>
          current.map(
            (integration) =>
              integration.id === id
                ? {
                    ...integration,
                    status: "error",
                    latency: "—",
                    lastChecked:
                      "Just now",
                  }
                : integration
          )
      );

      setError(
        err?.response?.data?.detail ||
          `Unable to check ${id} integration.`
      );
    } finally {
      setChecking(null);
    }
  };

  // ============================================================
  // CHECK ALL INTEGRATIONS
  // ============================================================

  const handleCheckAll = async () => {
    try {
      setChecking("all");
      setError("");

      const integrationNames =
        integrations.map(
          (integration) =>
            integration.id
        );

      const results =
        await checkAllIntegrations(
          integrationNames
        );

      setIntegrations(
        (current) =>
          current.map(
            (integration) => {
              const result =
                results.find(
                  (item) =>
                    item?.name ===
                    integration.id
                );

              if (!result) {
                return {
                  ...integration,
                  status: "error",
                  lastChecked:
                    "Just now",
                };
              }

              return {
                ...integration,
                ...normalizeIntegrationResult(
                  result
                ),
                lastChecked:
                  "Just now",
              };
            }
          )
      );
    } catch (err) {
      console.error(
        "Failed to check integrations:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to check integrations."
      );
    } finally {
      setChecking(null);
    }
  };

  // ============================================================
  // COUNTS
  // ============================================================

  const connectedCount =
    integrations.filter(
      (integration) =>
        integration.status ===
        "connected"
    ).length;

  const warningCount =
    integrations.filter(
      (integration) =>
        integration.status ===
        "warning"
    ).length;

  const errorCount =
    integrations.filter(
      (integration) =>
        integration.status ===
        "error"
    ).length;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor:
          "var(--background)",
        color:
          "var(--text)",
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
                <Link2 size={16} />
                Administration
              </div>

              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  color:
                    "var(--text-strong)",
                }}
              >
                Integrations
              </h1>

              <p
                className="mt-1 text-sm"
                style={{
                  color:
                    "var(--muted)",
                }}
              >
                Monitor connected services and
                platform integrations.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleCheckAll
              }
              disabled={
                checking === "all"
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{
                backgroundColor:
                  "var(--primary)",
                color: "#ffffff",
                border: "none",
                cursor:
                  checking === "all"
                    ? "wait"
                    : "pointer",
                opacity:
                  checking === "all"
                    ? 0.7
                    : 1,
              }}
            >
              <RefreshCw
                size={17}
                className={
                  checking === "all"
                    ? "animate-spin"
                    : ""
                }
              />

              {checking === "all"
                ? "Checking..."
                : "Check All"}
            </button>
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

            <p className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={
              <CheckCircle2
                size={20}
              />
            }
            label="Connected"
            value={connectedCount}
            type="success"
          />

          <SummaryCard
            icon={
              <AlertCircle
                size={20}
              />
            }
            label="Needs Attention"
            value={warningCount}
            type="warning"
          />

          <SummaryCard
            icon={
              <XCircle size={20} />
            }
            label="Unavailable"
            value={errorCount}
            type="danger"
          />
        </section>

        {/* ====================================================
            HEALTH BANNER
        ==================================================== */}

        <section className="mt-8">
          <div
            className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between"
            style={{
              backgroundColor:
                warningCount ||
                errorCount
                  ? "var(--warning-soft)"
                  : "var(--success-soft)",
              borderColor:
                warningCount ||
                errorCount
                  ? "rgba(217, 119, 6, 0.25)"
                  : "rgba(22, 163, 74, 0.20)",
            }}
          >
            <div className="flex items-center gap-3">
              {warningCount ||
              errorCount ? (
                <AlertCircle
                  size={20}
                  style={{
                    color:
                      "var(--warning)",
                  }}
                />
              ) : (
                <CheckCircle2
                  size={20}
                  style={{
                    color:
                      "var(--success)",
                  }}
                />
              )}

              <div>
                <p
                  className="font-semibold"
                  style={{
                    color:
                      "var(--text-strong)",
                  }}
                >
                  {warningCount ||
                  errorCount
                    ? "Some integrations need attention"
                    : "All integrations operational"}
                </p>

                <p
                  className="mt-0.5 text-xs"
                  style={{
                    color:
                      "var(--muted)",
                  }}
                >
                  {connectedCount} of{" "}
                  {integrations.length}{" "}
                  services are currently
                  connected.
                </p>
              </div>
            </div>

            <span
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor:
                  "var(--surface)",
                color:
                  warningCount ||
                  errorCount
                    ? "var(--warning)"
                    : "var(--success)",
                border:
                  "1px solid var(--border)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor:
                    warningCount ||
                    errorCount
                      ? "var(--warning)"
                      : "var(--success)",
                }}
              />

              System Health
            </span>
          </div>
        </section>

        {/* ====================================================
            INTEGRATIONS
        ==================================================== */}

        <section className="mt-8">
          <div className="mb-5">
            <h2
              className="text-lg font-semibold"
              style={{
                color:
                  "var(--text-strong)",
              }}
            >
              Connected Services
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color:
                  "var(--muted)",
              }}
            >
              Monitor connection status, latency
              and service health.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {integrations.map(
              (integration) => (
                <IntegrationCard
                  key={
                    integration.id
                  }
                  integration={
                    integration
                  }
                  checking={
                    checking ===
                      integration.id ||
                    checking === "all"
                  }
                  onCheck={() =>
                    handleCheckIntegration(
                      integration.id
                    )
                  }
                  onView={() =>
                    setSelectedIntegration(
                      integration
                    )
                  }
                />
              )
            )}
          </div>
        </section>

        {/* ====================================================
            SECURITY NOTE
        ==================================================== */}

        <section className="mt-8">
          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor:
                "var(--primary-soft)",
              borderColor:
                "rgba(10, 168, 158, 0.25)",
            }}
          >
            <div className="flex gap-4">
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor:
                    "var(--surface)",
                  color:
                    "var(--primary)",
                }}
              >
                <KeyRound
                  size={18}
                />
              </div>

              <div>
                <h3
                  className="font-semibold"
                  style={{
                    color:
                      "var(--text-strong)",
                  }}
                >
                  Integration Security
                </h3>

                <p
                  className="mt-1 text-sm leading-6"
                  style={{
                    color:
                      "var(--muted)",
                  }}
                >
                  Integration credentials and API
                  keys are intentionally hidden from
                  this interface. Connection
                  configuration is handled securely
                  by the backend.
                </p>
              </div>
            </div>
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
            to="/admin/security"
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
            Security & Audit
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      {selectedIntegration && (
        <IntegrationModal
          integration={
            selectedIntegration
          }
          onClose={() =>
            setSelectedIntegration(null)
          }
          onCheck={() => {
            const id =
              selectedIntegration.id;

            setSelectedIntegration(
              null
            );

            handleCheckIntegration(
              id
            );
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   NORMALIZE BACKEND RESPONSE
============================================================ */

function normalizeIntegrationResult(
  data = {}
) {
  let status =
    data.status;

  if (
    status === "connected" ||
    status === "ok" ||
    status === "healthy" ||
    status === "success"
  ) {
    status = "connected";
  }

  if (
    status === "failed" ||
    status === "unavailable" ||
    status === "offline" ||
    status === "error"
  ) {
    status = "error";
  }

  /*
   * Backend can return:
   *
   * not_configured
   *
   * This is intentionally represented as
   * "warning" instead of pretending the
   * integration is connected.
   */
  if (
    status ===
    "not_configured"
  ) {
    status = "warning";
  }

  if (!status) {
    status = "error";
  }

  const latency =
    data.latency_ms ??
    data.latency ??
    data.response_time_ms;

  return {
    status,

    latency:
      latency !== undefined &&
      latency !== null
        ? `${latency} ms`
        : "—",
  };
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
        : "var(--success)";

  const background =
    type === "warning"
      ? "var(--warning-soft)"
      : type === "danger"
        ? "var(--danger-soft)"
        : "var(--success-soft)";

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
   INTEGRATION CARD
============================================================ */

function IntegrationCard({
  integration,
  checking,
  onCheck,
  onView,
}) {
  const statusConfig = {
    connected: {
      label: "Connected",
      color:
        "var(--success)",
      background:
        "var(--success-soft)",
      icon: (
        <CheckCircle2
          size={15}
        />
      ),
    },

    warning: {
      label: "Needs Attention",
      color:
        "var(--warning)",
      background:
        "var(--warning-soft)",
      icon: (
        <AlertCircle
          size={15}
        />
      ),
    },

    error: {
      label: "Unavailable",
      color:
        "var(--danger)",
      background:
        "var(--danger-soft)",
      icon: (
        <XCircle size={15} />
      ),
    },
  };

  const status =
    statusConfig[
      integration.status
    ] ||
    statusConfig.error;

  return (
    <div className="foodchow-card p-5 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
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
            {integration.icon}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="font-semibold"
                style={{
                  color:
                    "var(--text-strong)",
                }}
              >
                {integration.name}
              </h3>

              <span
                className="rounded-full border px-2 py-0.5 text-[10px]"
                style={{
                  borderColor:
                    "var(--border)",
                  color:
                    "var(--muted)",
                }}
              >
                {integration.category}
              </span>
            </div>

            <p
              className="mt-1 text-xs leading-5"
              style={{
                color:
                  "var(--muted)",
              }}
            >
              {integration.description}
            </p>
          </div>
        </div>

        <div
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor:
              status.background,
            color:
              status.color,
          }}
        >
          {status.icon}

          <span className="hidden sm:inline">
            {status.label}
          </span>
        </div>
      </div>

      <div
        className="mt-5 grid grid-cols-2 gap-3 border-t pt-4"
        style={{
          borderColor:
            "var(--border)",
        }}
      >
        <div>
          <p
            className="text-[11px]"
            style={{
              color:
                "var(--muted)",
            }}
          >
            Response Time
          </p>

          <p
            className="mt-1 text-sm font-semibold"
            style={{
              color:
                "var(--text-strong)",
            }}
          >
            {integration.latency}
          </p>
        </div>

        <div>
          <p
            className="text-[11px]"
            style={{
              color:
                "var(--muted)",
            }}
          >
            Last Checked
          </p>

          <p
            className="mt-1 text-sm font-semibold"
            style={{
              color:
                "var(--text-strong)",
            }}
          >
            {integration.lastChecked}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCheck}
          disabled={checking}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold"
          style={{
            backgroundColor:
              "var(--surface)",
            borderColor:
              "var(--border)",
            color:
              "var(--text)",
            cursor:
              checking
                ? "wait"
                : "pointer",
            opacity:
              checking ? 0.7 : 1,
          }}
        >
          {checking ? (
            <Loader2
              size={14}
              className="animate-spin"
            />
          ) : (
            <RefreshCw
              size={14}
            />
          )}

          {checking
            ? "Checking..."
            : "Test Connection"}
        </button>

        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold"
          style={{
            backgroundColor:
              "var(--primary-soft)",
            color:
              "var(--primary)",
            border: "none",
            cursor:
              "pointer",
          }}
        >
          <Settings size={14} />
          Details
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MODAL
============================================================ */

function IntegrationModal({
  integration,
  onClose,
  onCheck,
}) {
  const statusLabel =
    integration.status ===
    "connected"
      ? "Connected"
      : integration.status ===
        "warning"
        ? "Needs Attention"
        : "Unavailable";

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
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor:
                  "var(--primary-soft)",
                color:
                  "var(--primary)",
              }}
            >
              {integration.icon}
            </div>

            <div>
              <h2
                className="text-lg font-semibold"
                style={{
                  color:
                    "var(--text-strong)",
                }}
              >
                {integration.name}
              </h2>

              <p
                className="mt-0.5 text-xs"
                style={{
                  color:
                    "var(--muted)",
                }}
              >
                {integration.category}
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
            ×
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <InfoRow
            label="Description"
            value={
              integration.description
            }
          />

          <InfoRow
            label="Status"
            value={statusLabel}
          />

          <InfoRow
            label="Response Time"
            value={
              integration.latency
            }
          />

          <InfoRow
            label="Last Checked"
            value={
              integration.lastChecked
            }
          />
        </div>

        <div
          className="mt-6 rounded-xl border p-4"
          style={{
            backgroundColor:
              "var(--primary-soft)",
            borderColor:
              "rgba(10, 168, 158, 0.20)",
          }}
        >
          <div className="flex gap-3">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0"
              style={{
                color:
                  "var(--primary)",
              }}
            />

            <p
              className="text-xs leading-5"
              style={{
                color:
                  "var(--muted)",
              }}
            >
              Credentials and secrets are managed
              by the backend and are not displayed
              here.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium"
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
            Close
          </button>

          <button
            type="button"
            onClick={onCheck}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{
              backgroundColor:
                "var(--primary)",
              color:
                "#ffffff",
              border: "none",
              cursor:
                "pointer",
            }}
          >
            <RefreshCw size={15} />
            Test Connection
          </button>
        </div>
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

export default AdminIntegrations;