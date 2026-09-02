import {
  Settings as SettingsIcon,
  Server,
  Database,
  Brain,
  ShieldCheck,
  Bell,
  Globe,
  CheckCircle2,
  LockKeyhole,
  Sparkles,
  Activity,
  Cpu,
} from 'lucide-react'

function Settings() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <section className="mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                  <SettingsIcon
                    size={23}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Settings
                  </h1>

                  <p className="mt-1 text-sm text-slate-400">
                    Configuration and system status for FoodChow AI Support Agent
                  </p>
                </div>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <span className="text-sm font-medium text-emerald-300">
                  System Operational
                </span>
              </div>
            </div>
          </section>

          {/* System Status */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                System Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current status of the AI support infrastructure
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatusCard
                icon={<Server size={19} />}
                title="Backend API"
                status="Connected"
                detail="FastAPI"
              />

              <StatusCard
                icon={<Database size={19} />}
                title="MongoDB"
                status="Connected"
                detail="Operational data"
              />

              <StatusCard
                icon={<Brain size={19} />}
                title="RAG Pipeline"
                status="Available"
                detail="Knowledge retrieval"
              />

              <StatusCard
                icon={<ShieldCheck size={19} />}
                title="Guardrails"
                status="Active"
                detail="Action validation"
              />
            </div>
          </section>

          {/* Configuration */}
          <section className="mb-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Configuration
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current application and AI configuration
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {/* General */}
              <SettingsCard
                icon={<Globe size={19} />}
                title="General"
                description="Application configuration"
              >
                <SettingRow
                  label="Application Name"
                  value="FoodChow AI Support Agent"
                />

                <SettingRow
                  label="Environment"
                  value="Development"
                />

                <SettingRow
                  label="Frontend"
                  value="React + Vite"
                />

                <SettingRow
                  label="Backend"
                  value="FastAPI"
                />

                <SettingRow
                  label="Database"
                  value="MongoDB"
                />
              </SettingsCard>

              {/* AI */}
              <SettingsCard
                icon={<Brain size={19} />}
                title="AI & Knowledge"
                description="AI support configuration"
              >
                <SettingRow
                  label="LLM Provider"
                  value="Google Gemini"
                />

                <SettingRow
                  label="Knowledge Retrieval"
                  value="Enabled"
                  valueType="success"
                />

                <SettingRow
                  label="Vector Store"
                  value="ChromaDB"
                />

                <SettingRow
                  label="Embedding Model"
                  value="all-MiniLM-L6-v2"
                />

                <SettingRow
                  label="Retrieval Top K"
                  value="5"
                />
              </SettingsCard>

              {/* Agent */}
              <SettingsCard
                icon={<Sparkles size={19} />}
                title="AI Agent"
                description="Support agent capabilities"
              >
                <SettingRow
                  label="Intent Detection"
                  value="Enabled"
                  valueType="success"
                />

                <SettingRow
                  label="Operational Tools"
                  value="Enabled"
                  valueType="success"
                />

                <SettingRow
                  label="Contextual Follow-up"
                  value="Enabled"
                  valueType="success"
                />

                <SettingRow
                  label="Human Escalation"
                  value="Enabled"
                  valueType="success"
                />

                <SettingRow
                  label="Response Fallback"
                  value="Enabled"
                  valueType="success"
                />
              </SettingsCard>

              {/* Security */}
              <SettingsCard
                icon={<LockKeyhole size={19} />}
                title="Security & Guardrails"
                description="Agent safety controls"
              >
                <SettingRow
                  label="Action Validation"
                  value="Active"
                  valueType="success"
                />

                <SettingRow
                  label="Sensitive Action Protection"
                  value="Active"
                  valueType="success"
                />

                <SettingRow
                  label="Human Escalation"
                  value="Active"
                  valueType="success"
                />

                <SettingRow
                  label="Verified Operational Data"
                  value="Required"
                  valueType="success"
                />
              </SettingsCard>
            </div>
          </section>

          {/* Notification / monitoring */}
          <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-black/10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Bell size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-100">
                  Monitoring & Notifications
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Operational events tracked by the support system
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <MonitoringItem
                icon={<Activity size={17} />}
                title="Agent Activity"
                description="Workflow events are recorded."
              />

              <MonitoringItem
                icon={<ShieldCheck size={17} />}
                title="Escalations"
                description="Critical cases are routed to support."
              />

              <MonitoringItem
                icon={<Cpu size={17} />}
                title="System Errors"
                description="Backend and service failures are surfaced."
              />
            </div>
          </section>

          {/* Configuration status */}
          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2
                size={18}
                className="text-emerald-400"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Configuration loaded successfully
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                FoodChow AI Support Agent is ready for operation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SettingsCard({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-black/10 transition hover:border-slate-700">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-100">
            {title}
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  )
}

function StatusCard({
  icon,
  title,
  status,
  detail,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/10 transition hover:border-slate-700">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>

        <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Online
        </span>
      </div>

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-1 font-semibold text-slate-100">
        {status}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {detail}
      </p>
    </div>
  )
}

function SettingRow({
  label,
  value,
  valueType = 'default',
}) {
  const valueClass =
    valueType === 'success'
      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
      : 'border-slate-800 bg-slate-950 text-slate-300'

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span
        className={`max-w-[60%] truncate rounded-lg border px-3 py-1.5 text-right text-xs font-medium ${valueClass}`}
        title={value}
      >
        {value}
      </span>
    </div>
  )
}

function MonitoringItem({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-200">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  )
}

export default Settings