import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import {
  getSystemSettings,
  updateSystemSettings,
} from "../../services/adminApi";

const DEFAULT_SETTINGS = {
  aiEnabled: true,
  aiConfidence: 80,
  autoClassification: true,
  autoResolution: false,
  humanHandoff: true,
  escalationEnabled: true,
  escalationMinutes: 30,
  ticketSla: 60,
  emailNotifications: true,
  browserNotifications: true,
  approvalNotifications: true,
  auditLogging: true,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
};

function AdminSystem() {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // LOAD SETTINGS FROM MONGODB
  // ============================================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getSystemSettings();

      const backendSettings =
        response?.settings || {};

      setSettings({
        ...DEFAULT_SETTINGS,
        ...backendSettings,
      });
    } catch (err) {
      console.error(
        "Failed to load system settings:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load system settings from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // ============================================================
  // UPDATE LOCAL SETTING
  // ============================================================

  const updateSetting = (
    key,
    value
  ) => {
    setSaved(false);
    setError("");

    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // ============================================================
  // SAVE SETTINGS TO MONGODB
  // ============================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      await updateSystemSettings(
        settings
      );

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error(
        "Failed to save system settings:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to save system settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setSaved(false);
    setError("");
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center"
        style={{
          backgroundColor:
            "var(--background)",
          color: "var(--text)",
        }}
      >
        <div className="text-center">
          <Loader2
            size={34}
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
            Loading system configuration...
          </p>
        </div>
      </div>
    );
  }

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

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div
                className="mb-2 flex items-center gap-2 text-sm"
                style={{
                  color:
                    "var(--primary)",
                }}
              >
                <Settings size={16} />
                Administration
              </div>

              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  color:
                    "var(--text-strong)",
                }}
              >
                System Configuration
              </h1>

              <p
                className="mt-1 text-sm"
                style={{
                  color:
                    "var(--muted)",
                }}
              >
                Configure AI behaviour, support
                workflows, notifications and
                security settings.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  resetSettings
                }
                disabled={saving}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium"
                style={{
                  backgroundColor:
                    "var(--surface)",
                  borderColor:
                    "var(--border)",
                  color:
                    "var(--text)",
                  cursor:
                    "pointer",
                  opacity:
                    saving ? 0.6 : 1,
                }}
              >
                Reset
              </button>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{
                  backgroundColor:
                    saved
                      ? "var(--success)"
                      : "var(--primary)",
                  color:
                    "#ffffff",
                  border: "none",
                  cursor:
                    "pointer",
                  opacity:
                    saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2
                      size={17}
                    />
                    Saved
                  </>
                ) : (
                  <>
                    <Save
                      size={17}
                    />
                    Save Changes
                  </>
                )}
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
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p className="flex-1 text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {/* ====================================================
            SYSTEM STATUS
        ==================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            icon={
              <Activity size={20} />
            }
            label="System"
            value="Operational"
            status="Healthy"
          />

          <StatusCard
            icon={
              <Bot size={20} />
            }
            label="AI Support"
            value={
              settings.aiEnabled
                ? "Enabled"
                : "Disabled"
            }
            status={
              settings.aiEnabled
                ? "Active"
                : "Off"
            }
          />

          <StatusCard
            icon={
              <ShieldCheck
                size={20}
              />
            }
            label="Audit Logging"
            value={
              settings.auditLogging
                ? "Enabled"
                : "Disabled"
            }
            status={
              settings.auditLogging
                ? "Protected"
                : "Off"
            }
          />

          <StatusCard
            icon={
              <Bell size={20} />
            }
            label="Notifications"
            value={
              settings.emailNotifications ||
              settings.browserNotifications
                ? "Enabled"
                : "Disabled"
            }
            status="Configured"
          />
        </section>

        {/* ====================================================
            AI CONFIGURATION
        ==================================================== */}

        <ConfigSection
          icon={
            <Sparkles size={20} />
          }
          title="AI Support Configuration"
          description="Control how the FoodChow AI support agent behaves."
        >
          <SettingToggle
            label="AI Support Agent"
            description="Enable the AI support assistant for customer conversations."
            value={
              settings.aiEnabled
            }
            onChange={(value) =>
              updateSetting(
                "aiEnabled",
                value
              )
            }
          />

          <SettingToggle
            label="Automatic Classification"
            description="Automatically classify incoming support requests."
            value={
              settings.autoClassification
            }
            onChange={(value) =>
              updateSetting(
                "autoClassification",
                value
              )
            }
          />

          <SettingToggle
            label="Automatic Resolution"
            description="Allow the AI agent to resolve eligible low-risk issues automatically."
            value={
              settings.autoResolution
            }
            onChange={(value) =>
              updateSetting(
                "autoResolution",
                value
              )
            }
          />

          <SettingToggle
            label="Human Handoff"
            description="Allow conversations to be escalated to a human support agent."
            value={
              settings.humanHandoff
            }
            onChange={(value) =>
              updateSetting(
                "humanHandoff",
                value
              )
            }
          />

          <RangeSetting
            label="AI Confidence Threshold"
            description="Minimum confidence required before the AI performs an automated response."
            value={
              settings.aiConfidence
            }
            min={50}
            max={100}
            suffix="%"
            onChange={(value) =>
              updateSetting(
                "aiConfidence",
                Number(value)
              )
            }
          />
        </ConfigSection>

        {/* ====================================================
            SUPPORT
        ==================================================== */}

        <ConfigSection
          icon={
            <SlidersHorizontal
              size={20}
            />
          }
          title="Support & Escalation"
          description="Configure ticket escalation and service-level behaviour."
        >
          <SettingToggle
            label="Automatic Escalation"
            description="Escalate unresolved support conversations after the configured period."
            value={
              settings.escalationEnabled
            }
            onChange={(value) =>
              updateSetting(
                "escalationEnabled",
                value
              )
            }
          />

          <NumberSetting
            label="Escalation Time"
            description="Time before an unresolved conversation is escalated."
            value={
              settings.escalationMinutes
            }
            suffix="minutes"
            min={5}
            max={240}
            onChange={(value) =>
              updateSetting(
                "escalationMinutes",
                Number(value)
              )
            }
          />

          <NumberSetting
            label="Ticket SLA"
            description="Default service-level target for support tickets."
            value={
              settings.ticketSla
            }
            suffix="minutes"
            min={15}
            max={480}
            onChange={(value) =>
              updateSetting(
                "ticketSla",
                Number(value)
              )
            }
          />
        </ConfigSection>

        {/* ====================================================
            NOTIFICATIONS
        ==================================================== */}

        <ConfigSection
          icon={
            <Bell size={20} />
          }
          title="Notifications"
          description="Configure system and support notifications."
        >
          <SettingToggle
            label="Email Notifications"
            description="Send important support and administration events through email."
            value={
              settings.emailNotifications
            }
            onChange={(value) =>
              updateSetting(
                "emailNotifications",
                value
              )
            }
          />

          <SettingToggle
            label="Browser Notifications"
            description="Show real-time notifications inside the support dashboard."
            value={
              settings.browserNotifications
            }
            onChange={(value) =>
              updateSetting(
                "browserNotifications",
                value
              )
            }
          />

          <SettingToggle
            label="Approval Notifications"
            description="Notify administrators when new access requests require review."
            value={
              settings.approvalNotifications
            }
            onChange={(value) =>
              updateSetting(
                "approvalNotifications",
                value
              )
            }
          />
        </ConfigSection>

        {/* ====================================================
            SECURITY
        ==================================================== */}

        <ConfigSection
          icon={
            <ShieldCheck
              size={20}
            />
          }
          title="Security"
          description="Configure session and security controls."
        >
          <SettingToggle
            label="Audit Logging"
            description="Record important authentication, administration and system events."
            value={
              settings.auditLogging
            }
            onChange={(value) =>
              updateSetting(
                "auditLogging",
                value
              )
            }
          />

          <NumberSetting
            label="Session Timeout"
            description="Automatically expire inactive user sessions."
            value={
              settings.sessionTimeout
            }
            suffix="minutes"
            min={15}
            max={480}
            onChange={(value) =>
              updateSetting(
                "sessionTimeout",
                Number(value)
              )
            }
          />

          <NumberSetting
            label="Maximum Login Attempts"
            description="Maximum failed login attempts before additional protection is applied."
            value={
              settings.maxLoginAttempts
            }
            suffix="attempts"
            min={3}
            max={10}
            onChange={(value) =>
              updateSetting(
                "maxLoginAttempts",
                Number(value)
              )
            }
          />
        </ConfigSection>

        {/* ====================================================
            SECURITY WARNING
        ==================================================== */}

        <section className="mt-8">
          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor:
                "var(--warning-soft)",
              borderColor:
                "rgba(217, 119, 6, 0.25)",
            }}
          >
            <div className="flex gap-4">
              <div
                className="mt-0.5 rounded-lg p-2"
                style={{
                  backgroundColor:
                    "rgba(217, 119, 6, 0.10)",
                  color:
                    "var(--warning)",
                }}
              >
                <AlertTriangle
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
                  Sensitive Configuration
                </h3>

                <p
                  className="mt-1 text-sm leading-6"
                  style={{
                    color:
                      "var(--muted)",
                  }}
                >
                  API keys, database credentials
                  and other secrets should never
                  be displayed in the frontend.
                  Store sensitive credentials in
                  backend environment variables and
                  secret storage.
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
            to="/admin/integrations"
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
            Integrations
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   STATUS CARD
============================================================ */

function StatusCard({
  icon,
  label,
  value,
  status,
}) {
  return (
    <div className="foodchow-card p-5">
      <div className="flex items-start justify-between">
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

        <span
          className="text-xs font-medium"
          style={{
            color:
              "var(--success)",
          }}
        >
          {status}
        </span>
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
        className="mt-1 text-lg font-bold"
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
   CONFIG SECTION
============================================================ */

function ConfigSection({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-start gap-3">
        <div
          className="rounded-xl p-2.5"
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
          <h2
            className="text-base font-semibold"
            style={{
              color:
                "var(--text-strong)",
            }}
          >
            {title}
          </h2>

          <p
            className="mt-1 text-sm"
            style={{
              color:
                "var(--muted)",
            }}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="foodchow-card overflow-hidden divide-y">
        {children}
      </div>
    </section>
  );
}

/* ============================================================
   TOGGLE
============================================================ */

function SettingToggle({
  label,
  description,
  value,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 px-6 py-5">
      <div className="min-w-0">
        <p
          className="text-sm font-semibold"
          style={{
            color:
              "var(--text-strong)",
          }}
        >
          {label}
        </p>

        <p
          className="mt-1 max-w-2xl text-xs leading-5"
          style={{
            color:
              "var(--muted)",
          }}
        >
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!value)
        }
        className="relative h-7 w-12 shrink-0 rounded-full"
        style={{
          backgroundColor:
            value
              ? "var(--primary)"
              : "var(--border)",
          border: "none",
          cursor:
            "pointer",
        }}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full transition-all duration-200"
          style={{
            left: value
              ? "24px"
              : "4px",
            backgroundColor:
              "#ffffff",
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.18)",
          }}
        />

        {value && (
          <Check
            size={11}
            className="absolute left-[29px] top-[7px]"
            style={{
              color:
                "var(--primary)",
            }}
          />
        )}
      </button>
    </div>
  );
}

/* ============================================================
   RANGE
============================================================ */

function RangeSetting({
  label,
  description,
  value,
  min,
  max,
  suffix,
  onChange,
}) {
  return (
    <div className="px-6 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p
            className="text-sm font-semibold"
            style={{
              color:
                "var(--text-strong)",
            }}
          >
            {label}
          </p>

          <p
            className="mt-1 text-xs leading-5"
            style={{
              color:
                "var(--muted)",
            }}
          >
            {description}
          </p>
        </div>

        <span
          className="text-lg font-bold"
          style={{
            color:
              "var(--primary)",
          }}
        >
          {value}
          {suffix}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-4 w-full"
      />
    </div>
  );
}

/* ============================================================
   NUMBER
============================================================ */

function NumberSetting({
  label,
  description,
  value,
  suffix,
  min,
  max,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p
          className="text-sm font-semibold"
          style={{
            color:
              "var(--text-strong)",
          }}
        >
          {label}
        </p>

        <p
          className="mt-1 text-xs leading-5"
          style={{
            color:
              "var(--muted)",
          }}
        >
          {description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-24 rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{
            backgroundColor:
              "var(--surface-soft)",
            borderColor:
              "var(--border)",
            color:
              "var(--text)",
          }}
        />

        <span
          className="text-xs"
          style={{
            color:
              "var(--muted)",
          }}
        >
          {suffix}
        </span>
      </div>
    </div>
  );
}

export default AdminSystem;