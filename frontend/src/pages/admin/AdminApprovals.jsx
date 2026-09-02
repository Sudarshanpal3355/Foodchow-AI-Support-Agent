import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";

const INITIAL_REQUESTS = [
  {
    id: "REQ-1001",
    name: "Arjun Mehta",
    email: "arjun@foodchow.com",
    requestedRole: "support_agent",
    reason: "Customer support team access",
    requestedAt: "10 minutes ago",
    status: "pending",
  },
  {
    id: "REQ-1002",
    name: "Sneha Rao",
    email: "sneha@foodchow.com",
    requestedRole: "viewer",
    reason: "Analytics and ticket monitoring",
    requestedAt: "32 minutes ago",
    status: "pending",
  },
  {
    id: "REQ-1003",
    name: "Vikram Singh",
    email: "vikram@foodchow.com",
    requestedRole: "support_agent",
    reason: "Restaurant support operations",
    requestedAt: "1 hour ago",
    status: "pending",
  },
  {
    id: "REQ-1004",
    name: "Kavya Nair",
    email: "kavya@foodchow.com",
    requestedRole: "viewer",
    reason: "Read-only support access",
    requestedAt: "3 hours ago",
    status: "approved",
  },
  {
    id: "REQ-1005",
    name: "Rohan Das",
    email: "rohan@foodchow.com",
    requestedRole: "support_agent",
    reason: "Technical support access",
    requestedAt: "Yesterday",
    status: "rejected",
  },
];

function AdminApprovals() {
  const [requests, setRequests] = useState(
    INITIAL_REQUESTS
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "rejected"
  ).length;

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        request.name.toLowerCase().includes(query) ||
        request.email.toLowerCase().includes(query) ||
        request.id.toLowerCase().includes(query) ||
        request.reason.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const updateRequestStatus = (id, status) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
            }
          : request
      )
    );

    setSelectedRequest(null);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--text)",
      }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            to="/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:gap-3"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
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
                  color: "var(--primary)",
                }}
              >
                <UserCheck size={16} />
                Administration
              </div>

              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  color: "var(--text-strong)",
                }}
              >
                Access Approvals
              </h1>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--muted)",
                }}
              >
                Review and manage requests for FoodChow platform access.
              </p>
            </div>

            {pendingCount > 0 && (
              <div
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-3"
                style={{
                  backgroundColor: "var(--warning-soft)",
                  borderColor:
                    "rgba(217, 119, 6, 0.25)",
                  color: "var(--warning)",
                }}
              >
                <Clock3 size={17} />
                <span className="text-sm font-semibold">
                  {pendingCount} Pending Review
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={<Clock3 size={20} />}
            label="Pending Requests"
            value={pendingCount}
            type="warning"
          />

          <SummaryCard
            icon={<CheckCircle2 size={20} />}
            label="Approved"
            value={approvedCount}
            type="success"
          />

          <SummaryCard
            icon={<XCircle size={20} />}
            label="Rejected"
            value={rejectedCount}
            type="danger"
          />
        </section>

        {/* Approval queue */}
        <section className="mt-8">
          <div className="foodchow-card overflow-hidden">
            <div
              className="border-b px-5 py-5"
              style={{
                borderColor: "var(--border)",
              }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{
                      color: "var(--text-strong)",
                    }}
                  >
                    Approval Queue
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: "var(--muted)",
                    }}
                  >
                    {filteredRequests.length} request
                    {filteredRequests.length !== 1
                      ? "s"
                      : ""}{" "}
                    shown
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{
                        color: "var(--muted)",
                      }}
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search requests..."
                      className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none sm:w-64"
                      style={{
                        backgroundColor:
                          "var(--surface-soft)",
                        borderColor:
                          "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                    className="rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{
                      backgroundColor:
                        "var(--surface-soft)",
                      borderColor:
                        "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    <option value="pending">
                      Pending
                    </option>
                    <option value="approved">
                      Approved
                    </option>
                    <option value="rejected">
                      Rejected
                    </option>
                    <option value="all">
                      All Requests
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px]">
                <thead
                  style={{
                    backgroundColor:
                      "var(--surface-soft)",
                  }}
                >
                  <tr>
                    <TableHeading>
                      Requester
                    </TableHeading>

                    <TableHeading>
                      Requested Role
                    </TableHeading>

                    <TableHeading>
                      Reason
                    </TableHeading>

                    <TableHeading>
                      Requested
                    </TableHeading>

                    <TableHeading>
                      Status
                    </TableHeading>

                    <TableHeading>
                      Actions
                    </TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map(
                    (request) => (
                      <tr
                        key={request.id}
                        className="border-t"
                        style={{
                          borderColor:
                            "var(--border)",
                        }}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={request.name}
                            />

                            <div>
                              <p
                                className="font-medium"
                                style={{
                                  color:
                                    "var(--text-strong)",
                                }}
                              >
                                {request.name}
                              </p>

                              <p
                                className="mt-0.5 text-xs"
                                style={{
                                  color:
                                    "var(--muted)",
                                }}
                              >
                                {request.email}
                              </p>

                              <p
                                className="mt-0.5 text-[11px]"
                                style={{
                                  color:
                                    "var(--muted-light)",
                                }}
                              >
                                {request.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <RoleBadge
                            role={
                              request.requestedRole
                            }
                          />
                        </td>

                        <td
                          className="max-w-[220px] px-5 py-4 text-sm"
                          style={{
                            color: "var(--muted)",
                          }}
                        >
                          {request.reason}
                        </td>

                        <td
                          className="px-5 py-4 text-sm"
                          style={{
                            color: "var(--muted)",
                          }}
                        >
                          {request.requestedAt}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={request.status}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <ActionButtons
                            request={request}
                            onView={() =>
                              setSelectedRequest(
                                request
                              )
                            }
                            onApprove={() =>
                              updateRequestStatus(
                                request.id,
                                "approved"
                              )
                            }
                            onReject={() =>
                              updateRequestStatus(
                                request.id,
                                "rejected"
                              )
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y md:hidden">
              {filteredRequests.map(
                (request) => (
                  <div
                    key={request.id}
                    className="p-5"
                    style={{
                      borderColor:
                        "var(--border)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={request.name}
                        />

                        <div>
                          <p
                            className="font-medium"
                            style={{
                              color:
                                "var(--text-strong)",
                            }}
                          >
                            {request.name}
                          </p>

                          <p
                            className="text-xs"
                            style={{
                              color:
                                "var(--muted)",
                            }}
                          >
                            {request.email}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={request.status}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <RoleBadge
                        role={
                          request.requestedRole
                        }
                      />

                      <span
                        className="rounded-full border px-2.5 py-1 text-xs"
                        style={{
                          borderColor:
                            "var(--border)",
                          color: "var(--muted)",
                        }}
                      >
                        {request.id}
                      </span>
                    </div>

                    <p
                      className="mt-3 text-sm"
                      style={{
                        color: "var(--muted)",
                      }}
                    >
                      {request.reason}
                    </p>

                    <p
                      className="mt-2 text-xs"
                      style={{
                        color:
                          "var(--muted-light)",
                      }}
                    >
                      Requested{" "}
                      {request.requestedAt}
                    </p>

                    <div className="mt-4">
                      <ActionButtons
                        request={request}
                        onView={() =>
                          setSelectedRequest(
                            request
                          )
                        }
                        onApprove={() =>
                          updateRequestStatus(
                            request.id,
                            "approved"
                          )
                        }
                        onReject={() =>
                          updateRequestStatus(
                            request.id,
                            "rejected"
                          )
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            {filteredRequests.length === 0 && (
              <div className="px-6 py-16 text-center">
                <CheckCircle2
                  size={34}
                  className="mx-auto"
                  style={{
                    color: "var(--success)",
                  }}
                />

                <p
                  className="mt-3 font-medium"
                  style={{
                    color: "var(--text-strong)",
                  }}
                >
                  No requests found
                </p>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  There are no requests matching your
                  current filters.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Approval policy */}
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
                  color: "var(--primary)",
                }}
              >
                <ShieldCheck size={19} />
              </div>

              <div>
                <h3
                  className="font-semibold"
                  style={{
                    color:
                      "var(--text-strong)",
                  }}
                >
                  Access Control Policy
                </h3>

                <p
                  className="mt-1 text-sm leading-6"
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  Elevated access should be reviewed
                  before being granted. Admin access
                  should only be assigned to trusted
                  platform administrators.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
            Admin Console
          </Link>

          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{
              backgroundColor:
                "var(--primary-soft)",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            User Management
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      {selectedRequest && (
        <RequestModal
          request={selectedRequest}
          onClose={() =>
            setSelectedRequest(null)
          }
          onApprove={() =>
            updateRequestStatus(
              selectedRequest.id,
              "approved"
            )
          }
          onReject={() =>
            updateRequestStatus(
              selectedRequest.id,
              "rejected"
            )
          }
        />
      )}
    </div>
  );
}

/* -----------------------------
   Summary Card
----------------------------- */

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

  return (
    <div className="foodchow-card p-5">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          backgroundColor:
            type === "warning"
              ? "var(--warning-soft)"
              : type === "danger"
                ? "var(--danger-soft)"
                : "var(--success-soft)",
          color,
        }}
      >
        {icon}
      </div>

      <p
        className="mt-5 text-sm"
        style={{
          color: "var(--muted)",
        }}
      >
        {label}
      </p>

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

/* -----------------------------
   Table Heading
----------------------------- */

function TableHeading({ children }) {
  return (
    <th
      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
      style={{
        color: "var(--muted)",
      }}
    >
      {children}
    </th>
  );
}

/* -----------------------------
   Avatar
----------------------------- */

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
      style={{
        backgroundColor:
          "var(--primary-soft)",
        color: "var(--primary)",
      }}
    >
      {initials}
    </div>
  );
}

/* -----------------------------
   Role Badge
----------------------------- */

function RoleBadge({ role }) {
  const label =
    role === "admin"
      ? "Admin"
      : role === "support_agent"
        ? "Support Agent"
        : "Viewer";

  return (
    <span
      className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor:
          role === "admin"
            ? "var(--primary-soft)"
            : "var(--surface-soft)",
        borderColor: "var(--border)",
        color:
          role === "admin"
            ? "var(--primary)"
            : "var(--text)",
      }}
    >
      {label}
    </span>
  );
}

/* -----------------------------
   Status Badge
----------------------------- */

function StatusBadge({ status }) {
  const config = {
    pending: {
      label: "Pending",
      color: "var(--warning)",
      background:
        "var(--warning-soft)",
    },
    approved: {
      label: "Approved",
      color: "var(--success)",
      background:
        "var(--success-soft)",
    },
    rejected: {
      label: "Rejected",
      color: "var(--danger)",
      background:
        "var(--danger-soft)",
    },
  };

  const current =
    config[status] || config.pending;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor:
          current.background,
        borderColor: "var(--border)",
        color: current.color,
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

/* -----------------------------
   Action Buttons
----------------------------- */

function ActionButtons({
  request,
  onView,
  onApprove,
  onReject,
}) {
  const isPending =
    request.status === "pending";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onView}
        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
        style={{
          backgroundColor:
            "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text)",
          cursor: "pointer",
        }}
      >
        <Eye size={14} />
        View
      </button>

      {isPending && (
        <>
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
            style={{
              backgroundColor:
                "var(--success-soft)",
              color: "var(--success)",
              border:
                "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <Check size={14} />
            Approve
          </button>

          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
            style={{
              backgroundColor:
                "var(--danger-soft)",
              color: "var(--danger)",
              border:
                "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <X size={14} />
            Reject
          </button>
        </>
      )}
    </div>
  );
}

/* -----------------------------
   Request Modal
----------------------------- */

function RequestModal({
  request,
  onClose,
  onApprove,
  onReject,
}) {
  const isPending =
    request.status === "pending";

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
          borderColor: "var(--border)",
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
                color: "var(--primary)",
              }}
            >
              <UserPlus size={20} />
            </div>

            <div>
              <h2
                className="text-lg font-semibold"
                style={{
                  color:
                    "var(--text-strong)",
                }}
              >
                Access Request
              </h2>

              <p
                className="mt-0.5 text-xs"
                style={{
                  color: "var(--muted)",
                }}
              >
                {request.id}
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
              color: "var(--muted)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <DetailRow
            label="Requester"
            value={request.name}
          />

          <DetailRow
            label="Email"
            value={request.email}
          />

          <DetailRow
            label="Requested Role"
            value={
              request.requestedRole ===
              "support_agent"
                ? "Support Agent"
                : request.requestedRole ===
                    "admin"
                  ? "Admin"
                  : "Viewer"
            }
          />

          <DetailRow
            label="Reason"
            value={request.reason}
          />

          <DetailRow
            label="Requested"
            value={request.requestedAt}
          />

          <DetailRow
            label="Current Status"
            value={
              <StatusBadge
                status={request.status}
              />
            }
          />
        </div>

        {isPending ? (
          <div
            className="mt-6 rounded-xl border p-4"
            style={{
              backgroundColor:
                "var(--warning-soft)",
              borderColor:
                "rgba(217, 119, 6, 0.2)",
            }}
          >
            <div className="flex gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
                style={{
                  color:
                    "var(--warning)",
                }}
              />

              <p
                className="text-xs leading-5"
                style={{
                  color: "var(--muted)",
                }}
              >
                Review the requester and
                requested role before approving
                access.
              </p>
            </div>
          </div>
        ) : null}

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
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Close
          </button>

          {isPending && (
            <>
              <button
                type="button"
                onClick={onReject}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{
                  backgroundColor:
                    "var(--danger-soft)",
                  color: "var(--danger)",
                  border:
                    "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                Reject
              </button>

              <button
                type="button"
                onClick={onApprove}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{
                  backgroundColor:
                    "var(--success)",
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Detail Row
----------------------------- */

function DetailRow({ label, value }) {
  return (
    <div
      className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between"
      style={{
        borderColor: "var(--border)",
      }}
    >
      <span
        className="text-xs font-medium"
        style={{
          color: "var(--muted)",
        }}
      >
        {label}
      </span>

      <span
        className="text-sm font-medium sm:text-right"
        style={{
          color: "var(--text-strong)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default AdminApprovals;