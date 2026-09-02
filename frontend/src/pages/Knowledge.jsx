import {
  BookOpen,
  FileText,
  Search,
  Database,
  Brain,
  CheckCircle2,
  Layers3,
  Sparkles,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { useMemo, useState } from 'react'

function Knowledge() {
  const [search, setSearch] = useState('')

  const knowledgeSources = [
    {
      title: 'Order & Online Ordering',
      description:
        'Information about order status, order processing, delivery, and common online ordering issues.',
      files: [
        'online_ordering/basics.md',
        'online_ordering/troubleshooting.md',
      ],
    },
    {
      title: 'Payments',
      description:
        'Payment status, successful payments, failed payments, and payment troubleshooting guidance.',
      files: [
        'payments/basics.md',
        'payments/troubleshooting.md',
      ],
    },
    {
      title: 'Printers',
      description:
        'Printer setup, connection status, paper issues, and printer troubleshooting procedures.',
      files: [
        'printers/setup.md',
        'printers/troubleshooting.md',
      ],
    },
    {
      title: 'KDS',
      description:
        'Kitchen Display System setup, connectivity, pending orders, and troubleshooting information.',
      files: [
        'kds/basics.md',
        'kds/troubleshooting.md',
      ],
    },
    {
      title: 'Menu Management',
      description:
        'Menu configuration, outlet menus, menu synchronization, and troubleshooting.',
      files: [
        'menu_management/basics.md',
        'menu_management/troubleshooting.md',
      ],
    },
    {
      title: 'Accounts & Security',
      description:
        'Account access, account status, security verification, and account troubleshooting.',
      files: [
        'accounts/basics.md',
        'accounts/security.md',
      ],
    },
    {
      title: 'Restaurant Setup',
      description:
        'Restaurant and outlet configuration and common setup troubleshooting.',
      files: [
        'restaurant_setup/setup.md',
        'restaurant_setup/troubleshooting.md',
      ],
    },
    {
      title: 'Troubleshooting',
      description:
        'General diagnostic procedures and escalation guidance for FoodChow support.',
      files: [
        'troubleshooting/common_issues.md',
        'troubleshooting/diagnostic_guide.md',
        'troubleshooting/escalation.md',
      ],
    },
  ]

  const filteredSources = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return knowledgeSources
    }

    return knowledgeSources.filter((source) => {
      const content = [
        source.title,
        source.description,
        ...source.files,
      ]
        .join(' ')
        .toLowerCase()

      return content.includes(query)
    })
  }, [search])

  const totalDocuments = knowledgeSources.reduce(
    (total, source) => total + source.files.length,
    0,
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <section className="mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                  <BookOpen
                    size={23}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Knowledge Base
                  </h1>

                  <p className="mt-1 text-sm text-slate-400">
                    RAG knowledge sources available to the AI support agent
                  </p>
                </div>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <span className="text-sm font-medium text-emerald-300">
                  Knowledge Ready
                </span>
              </div>
            </div>
          </section>

          {/* RAG status */}
          <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Brain size={20} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-100">
                      Retrieval-Augmented Generation
                    </h2>

                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                      Active
                    </span>
                  </div>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    The support agent can retrieve relevant information from
                    the indexed knowledge sources before generating responses.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck
                  size={15}
                  className="text-emerald-400"
                />
                Grounded support responses
              </div>
            </div>
          </section>

          {/* Overview */}
          <section className="mb-8 grid gap-4 md:grid-cols-3">
            <OverviewCard
              icon={<Database size={19} />}
              label="Knowledge Sources"
              value={knowledgeSources.length}
              description="Support knowledge categories"
            />

            <OverviewCard
              icon={<Layers3 size={19} />}
              label="Documents"
              value={totalDocuments}
              description="Indexed support documents"
            />

            <OverviewCard
              icon={<Brain size={19} />}
              label="Retrieval System"
              value="RAG Pipeline"
              description="Retrieve → Generate"
            />
          </section>

          {/* Search */}
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-black/10">
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 transition focus-within:border-blue-500/60">
              <Search
                size={18}
                className="shrink-0 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search categories or documents..."
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </section>

          {/* Categories */}
          <section>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Knowledge Categories
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Support documentation indexed for agent retrieval
                </p>
              </div>

              <span className="w-fit rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
                {filteredSources.length}{' '}
                {filteredSources.length === 1
                  ? 'category'
                  : 'categories'}
              </span>
            </div>

            {filteredSources.length === 0 ? (
              <EmptyState
                search={search}
                onClear={() => setSearch('')}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredSources.map((source) => (
                  <KnowledgeCard
                    key={source.title}
                    source={source}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

function OverviewCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/10 transition hover:border-slate-700">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {label}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold tracking-tight text-slate-100">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  )
}

function KnowledgeCard({ source }) {
  return (
    <article className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-slate-900">
      {/* Card header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <FileText size={20} />
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1">
          <CheckCircle2
            size={12}
            className="text-emerald-400"
          />

          <span className="text-[11px] font-medium text-emerald-400">
            Indexed
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-slate-100">
          {source.title}
        </h3>

        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </div>

      <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-400">
        {source.description}
      </p>

      {/* Documents */}
      <div className="mt-5 border-t border-slate-800 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Documents
          </span>

          <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
            {source.files.length}
          </span>
        </div>

        <div className="space-y-2">
          {source.files.map((file) => (
            <div
              key={file}
              className="group/file flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2.5 transition hover:border-slate-700"
            >
              <FileText
                size={13}
                className="shrink-0 text-slate-600"
              />

              <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-400">
                {file}
              </span>

              <ChevronRight
                size={13}
                className="shrink-0 text-slate-700 transition group-hover/file:text-slate-500"
              />
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

function EmptyState({ search, onClear }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
        <Search
          size={23}
          className="text-slate-500"
        />
      </div>

      <h3 className="text-lg font-semibold text-slate-200">
        No knowledge sources found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        No indexed category or document matches{' '}
        <span className="text-slate-300">
          "{search}"
        </span>
        .
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
      >
        <X size={15} />
        Clear Search
      </button>
    </div>
  )
}

export default Knowledge