import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserX,
  Users,
  X,
} from "lucide-react";

import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../../services/adminApi";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [openMenu, setOpenMenu] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD USERS FROM MONGODB
  // ============================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter !== "all") {
        params.role = roleFilter;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const data = await getAdminUsers(params);

      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load users from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, statusFilter]);

  // ============================================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        openMenu &&
        menuAnchor &&
        !menuAnchor.contains(event.target)
      ) {
        const menuElement =
          document.querySelector(
            "[data-foodchow-user-actions-menu]"
          );

        if (
          menuElement &&
          menuElement.contains(event.target)
        ) {
          return;
        }

        setOpenMenu(null);
        setMenuAnchor(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [openMenu, menuAnchor]);

  // ============================================================
  // CLOSE MENU ON ESCAPE
  // ============================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMenuAnchor(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ============================================================
  // CLIENT-SIDE FILTER
  // ============================================================

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.id?.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        user.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const activeCount = users.filter(
    (user) => user.status === "active"
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const agentCount = users.filter(
    (user) => user.role === "support_agent"
  ).length;

  const viewerCount = users.filter(
    (user) => user.role === "viewer"
  ).length;

  // ============================================================
  // OPEN / CLOSE ACTION MENU
  // ============================================================

  const toggleActionMenu = (event, userId) => {
    if (openMenu === userId) {
      setOpenMenu(null);
      setMenuAnchor(null);
      return;
    }

    setOpenMenu(userId);
    setMenuAnchor(event.currentTarget);
  };

  const closeActionMenu = () => {
    setOpenMenu(null);
    setMenuAnchor(null);
  };

  // ============================================================
  // CHANGE STATUS
  // ============================================================

  const toggleStatus = async (user) => {
    const newStatus =
      user.status === "active"
        ? "inactive"
        : "active";

    try {
      setActionLoading(`status-${user.id}`);
      setError("");

      const updatedUser = await updateAdminUser(
        user.id,
        {
          status: newStatus,
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? updatedUser
            : item
        )
      );

      closeActionMenu();
    } catch (err) {
      console.error(
        "Failed to update user status:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to update user status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // CHANGE ROLE
  // ============================================================

  const changeRole = async (user, role) => {
    if (user.role === role) {
      closeActionMenu();
      return;
    }

    try {
      setActionLoading(`role-${user.id}`);
      setError("");

      const updatedUser = await updateAdminUser(
        user.id,
        {
          role,
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? updatedUser
            : item
        )
      );

      closeActionMenu();
    } catch (err) {
      console.error(
        "Failed to change user role:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to change user role."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // DELETE USER
  // ============================================================

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete the account for ${user.name} (${user.email})?\n\n` +
        "This action permanently removes the user account."
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`delete-${user.id}`);
      setError("");

      await deleteAdminUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) => item.id !== user.id
        )
      );

      closeActionMenu();
    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to delete user account."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // CREATE USER
  // ============================================================

  const addUser = async (newUser) => {
    try {
      setActionLoading("create");
      setError("");

      const createdUser =
        await createAdminUser(newUser);

      setUsers((currentUsers) => [
        createdUser,
        ...currentUsers,
      ]);

      setShowCreateModal(false);
    } catch (err) {
      console.error(
        "Failed to create user:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to create user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--text)",
      }}
    >
      {/* ======================================================
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

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div
                className="mb-2 flex items-center gap-2 text-sm"
                style={{
                  color: "var(--primary)",
                }}
              >
                <Users size={16} />
                Administration
              </div>

              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  color: "var(--text-strong)",
                }}
              >
                User Management
              </h1>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--muted)",
                }}
              >
                Manage FoodChow users, roles and account
                access.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreateModal(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--primary)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                boxShadow:
                  "0 8px 20px rgba(10, 168, 158, 0.18)",
              }}
            >
              <Plus size={17} />
              Add User
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
              borderColor: "var(--border)",
              color: "var(--danger)",
            }}
          >
            <X
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="text-sm font-medium">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1"
              style={{
                border: "none",
                backgroundColor:
                  "transparent",
                color: "var(--danger)",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<Users size={20} />}
            label="Total Users"
            value={users.length}
          />

          <SummaryCard
            icon={<UserCheck size={20} />}
            label="Active Users"
            value={activeCount}
            status="Active"
          />

          <SummaryCard
            icon={<ShieldCheck size={20} />}
            label="Administrators"
            value={adminCount}
          />

          <SummaryCard
            icon={<UserCog size={20} />}
            label="Support Agents"
            value={agentCount}
          />
        </section>

        {/* ====================================================
            USER TABLE
        ==================================================== */}

        <section className="mt-8">
          <div className="foodchow-card">
            {/* Table Header */}

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
                      color:
                        "var(--text-strong)",
                    }}
                  >
                    All Users
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: "var(--muted)",
                    }}
                  >
                    {filteredUsers.length} user
                    {filteredUsers.length !== 1
                      ? "s"
                      : ""}{" "}
                    shown
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  {/* Search */}

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
                        setSearch(
                          event.target.value
                        )
                      }
                      placeholder="Search users..."
                      className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none md:w-64"
                      style={{
                        backgroundColor:
                          "var(--surface-soft)",
                        borderColor:
                          "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </div>

                  {/* Role */}

                  <select
                    value={roleFilter}
                    onChange={(event) =>
                      setRoleFilter(
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
                    <option value="all">
                      All Roles
                    </option>
                    <option value="admin">
                      Admin
                    </option>
                    <option value="support_agent">
                      Support Agent
                    </option>
                    <option value="viewer">
                      Viewer
                    </option>
                  </select>

                  {/* Status */}

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
                    <option value="all">
                      All Status
                    </option>
                    <option value="active">
                      Active
                    </option>
                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading */}

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={30}
                    className="mx-auto animate-spin"
                    style={{
                      color: "var(--primary)",
                    }}
                  />

                  <p
                    className="mt-3 text-sm"
                    style={{
                      color: "var(--muted)",
                    }}
                  >
                    Loading users...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop */}

                <div className="overflow-x-auto md:block">
                  <table className="hidden w-full min-w-[900px] md:table">
                    <thead
                      style={{
                        backgroundColor:
                          "var(--surface-soft)",
                      }}
                    >
                      <tr>
                        <TableHeading>
                          User
                        </TableHeading>

                        <TableHeading>
                          Role
                        </TableHeading>

                        <TableHeading>
                          Status
                        </TableHeading>

                        <TableHeading>
                          User ID
                        </TableHeading>

                        <TableHeading>
                          Actions
                        </TableHeading>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map(
                        (user) => (
                          <tr
                            key={user.id}
                            className="border-t transition-colors"
                            style={{
                              borderColor:
                                "var(--border)",
                            }}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={
                                    user.name
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
                                    {user.name}
                                  </p>

                                  <p
                                    className="mt-0.5 text-xs"
                                    style={{
                                      color:
                                        "var(--muted)",
                                    }}
                                  >
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <RoleBadge
                                role={
                                  user.role
                                }
                              />
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={
                                  user.status
                                }
                              />
                            </td>

                            <td
                              className="px-5 py-4 text-xs"
                              style={{
                                color:
                                  "var(--muted)",
                              }}
                            >
                              {user.id}
                            </td>

                            <td className="px-5 py-4">
                              <button
                                type="button"
                                disabled={
                                  actionLoading !==
                                  null
                                }
                                onClick={(event) =>
                                  toggleActionMenu(
                                    event,
                                    user.id
                                  )
                                }
                                className="rounded-lg p-2 transition-colors"
                                style={{
                                  backgroundColor:
                                    "var(--surface-soft)",
                                  color:
                                    "var(--muted)",
                                  border:
                                    "1px solid var(--border)",
                                  cursor:
                                    actionLoading
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    actionLoading
                                      ? 0.6
                                      : 1,
                                }}
                              >
                                <MoreHorizontal
                                  size={17}
                                />
                              </button>

                              {openMenu ===
                                user.id && (
                                <UserActionsMenu
                                  user={user}
                                  anchorEl={
                                    menuAnchor
                                  }
                                  actionLoading={
                                    actionLoading
                                  }
                                  onRoleChange={
                                    changeRole
                                  }
                                  onToggleStatus={
                                    toggleStatus
                                  }
                                  onDelete={
                                    handleDeleteUser
                                  }
                                />
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}

                <div className="divide-y md:hidden">
                  {filteredUsers.map(
                    (user) => (
                      <div
                        key={user.id}
                        className="relative p-5"
                        style={{
                          borderColor:
                            "var(--border)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={
                                user.name
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
                                {user.name}
                              </p>

                              <p
                                className="text-xs"
                                style={{
                                  color:
                                    "var(--muted)",
                                }}
                              >
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={
                              actionLoading !==
                              null
                            }
                            onClick={(event) =>
                              toggleActionMenu(
                                event,
                                user.id
                              )
                            }
                            className="rounded-lg p-2"
                            style={{
                              backgroundColor:
                                "var(--surface-soft)",
                              color:
                                "var(--muted)",
                              border:
                                "1px solid var(--border)",
                              cursor:
                                actionLoading
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                actionLoading
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            <MoreHorizontal
                              size={17}
                            />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <RoleBadge
                            role={user.role}
                          />

                          <StatusBadge
                            status={user.status}
                          />
                        </div>

                        <p
                          className="mt-3 text-xs"
                          style={{
                            color:
                              "var(--muted)",
                          }}
                        >
                          ID: {user.id}
                        </p>

                        {openMenu ===
                          user.id && (
                          <UserActionsMenu
                            user={user}
                            anchorEl={
                              menuAnchor
                            }
                            actionLoading={
                              actionLoading
                            }
                            onRoleChange={
                              changeRole
                            }
                            onToggleStatus={
                              toggleStatus
                            }
                            onDelete={
                              handleDeleteUser
                            }
                          />
                        )}
                      </div>
                    )
                  )}
                </div>

                {filteredUsers.length ===
                  0 && (
                  <div className="px-6 py-16 text-center">
                    <Users
                      size={32}
                      className="mx-auto"
                      style={{
                        color:
                          "var(--muted-light)",
                      }}
                    />

                    <p
                      className="mt-3 font-medium"
                      style={{
                        color:
                          "var(--text-strong)",
                      }}
                    >
                      No users found
                    </p>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color:
                          "var(--muted)",
                      }}
                    >
                      Try changing your
                      search or filters.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ====================================================
            ROLE SUMMARY
        ==================================================== */}

        <section className="mt-8">
          <div className="mb-4">
            <h2
              className="text-base font-semibold"
              style={{
                color: "var(--text-strong)",
              }}
            >
              Role Distribution
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--muted)",
              }}
            >
              Current user distribution across
              platform roles.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <RoleSummary
              role="Admin"
              description="Full platform administration"
              count={adminCount}
              icon={<ShieldCheck size={20} />}
            />

            <RoleSummary
              role="Support Agent"
              description="Customer support operations"
              count={agentCount}
              icon={<UserCog size={20} />}
            />

            <RoleSummary
              role="Viewer"
              description="Read-only platform access"
              count={viewerCount}
              icon={<Users size={20} />}
            />
          </div>
        </section>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
              backgroundColor:
                "var(--surface)",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
            Admin Console
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{
              backgroundColor:
                "var(--primary-soft)",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      {/* ======================================================
          CREATE USER MODAL
      ====================================================== */}

      {showCreateModal && (
        <CreateUserModal
          onClose={() =>
            setShowCreateModal(false)
          }
          onCreate={addUser}
          loading={
            actionLoading === "create"
          }
        />
      )}
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
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
            color: "var(--primary)",
          }}
        >
          {icon}
        </div>

        {status && (
          <span
            className="text-xs font-medium"
            style={{
              color: "var(--success)",
            }}
          >
            {status}
          </span>
        )}
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

/* ============================================================
   TABLE HEADING
============================================================ */

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

/* ============================================================
   AVATAR
============================================================ */

function Avatar({ name = "" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
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
      {initials || "U"}
    </div>
  );
}

/* ============================================================
   ROLE BADGE
============================================================ */

function RoleBadge({ role }) {
  const labels = {
    admin: "Admin",
    support_agent: "Support Agent",
    viewer: "Viewer",
  };

  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor:
          role === "admin"
            ? "var(--primary-soft)"
            : "var(--surface-soft)",
        color:
          role === "admin"
            ? "var(--primary)"
            : "var(--text)",
        border:
          "1px solid var(--border)",
      }}
    >
      {labels[role] || role}
    </span>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const active = status === "active";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: active
          ? "var(--success-soft)"
          : "var(--surface-soft)",
        color: active
          ? "var(--success)"
          : "var(--muted)",
        border:
          "1px solid var(--border)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: active
            ? "var(--success)"
            : "var(--muted)",
        }}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ============================================================
   ACTIONS MENU
   Rendered through document.body so it cannot be clipped
   by table/card overflow.
============================================================ */

function UserActionsMenu({
  user,
  anchorEl,
  actionLoading,
  onRoleChange,
  onToggleStatus,
  onDelete,
}) {
  const menuRef = useRef(null);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const roleLoading =
    actionLoading === `role-${user.id}`;

  const statusLoading =
    actionLoading === `status-${user.id}`;

  const deleteLoading =
    actionLoading === `delete-${user.id}`;

  useLayoutEffect(() => {
    if (!anchorEl) {
      return;
    }

    const updatePosition = () => {
      const anchorRect =
        anchorEl.getBoundingClientRect();

      const menuElement =
        menuRef.current;

      if (!menuElement) {
        return;
      }

      const menuRect =
        menuElement.getBoundingClientRect();

      const viewportWidth =
        window.innerWidth;

      const viewportHeight =
        window.innerHeight;

      const gap = 8;
      const padding = 12;

      // Try below the button first.
      let top =
        anchorRect.bottom + gap;

      // Align right edges.
      let left =
        anchorRect.right -
        menuRect.width;

      // If there isn't enough room below,
      // place the menu above the button.
      if (
        top + menuRect.height >
        viewportHeight - padding
      ) {
        top =
          anchorRect.top -
          menuRect.height -
          gap;
      }

      // Keep inside left edge.
      if (left < padding) {
        left = padding;
      }

      // Keep inside right edge.
      if (
        left + menuRect.width >
        viewportWidth - padding
      ) {
        left =
          viewportWidth -
          menuRect.width -
          padding;
      }

      // Keep inside top edge.
      if (top < padding) {
        top = padding;
      }

      // Keep inside bottom edge.
      if (
        top + menuRect.height >
        viewportHeight - padding
      ) {
        top =
          viewportHeight -
          menuRect.height -
          padding;
      }

      setPosition({
        top,
        left,
      });
    };

    // First calculation.
    updatePosition();

    // Second calculation after the menu
    // has completely rendered.
    const frame =
      requestAnimationFrame(
        updatePosition
      );

    window.addEventListener(
      "resize",
      updatePosition
    );

    window.addEventListener(
      "scroll",
      updatePosition,
      true
    );

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "resize",
        updatePosition
      );

      window.removeEventListener(
        "scroll",
        updatePosition,
        true
      );
    };
  }, [anchorEl]);

  if (!anchorEl) {
    return null;
  }

  const menu = (
    <div
      ref={menuRef}
      data-foodchow-user-actions-menu
      className="fixed z-[99999] w-60 rounded-xl border p-2 shadow-2xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        backgroundColor:
          "var(--surface)",
        borderColor:
          "var(--border)",
        color: "var(--text)",
      }}
    >
      {/* ==================================================
          CHANGE ROLE
      ================================================== */}

      <p
        className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
        style={{
          color: "var(--muted)",
        }}
      >
        Change Role
      </p>

      {[
        ["admin", "Admin"],
        [
          "support_agent",
          "Support Agent",
        ],
        ["viewer", "Viewer"],
      ].map(([role, label]) => (
        <button
          key={role}
          type="button"
          disabled={
            roleLoading ||
            statusLoading ||
            deleteLoading
          }
          onClick={() =>
            onRoleChange(user, role)
          }
          className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-all"
          style={{
            color: "var(--text)",
            backgroundColor:
              user.role === role
                ? "var(--primary-soft)"
                : "transparent",
            border: "none",
            cursor:
              roleLoading ||
              statusLoading ||
              deleteLoading
                ? "not-allowed"
                : "pointer",
            opacity:
              roleLoading ? 0.6 : 1,
          }}
        >
          <span
            className="mr-1 flex w-5 shrink-0 items-center justify-center"
            style={{
              color:
                user.role === role
                  ? "var(--primary)"
                  : "transparent",
              fontWeight: 700,
            }}
          >
            ✓
          </span>

          <span className="whitespace-nowrap">
            {label}
          </span>
        </button>
      ))}

      {/* ==================================================
          DIVIDER
      ================================================== */}

      <div
        className="my-2 border-t"
        style={{
          borderColor:
            "var(--border)",
        }}
      />

      {/* ==================================================
          STATUS
      ================================================== */}

      <button
        type="button"
        disabled={
          roleLoading ||
          statusLoading ||
          deleteLoading
        }
        onClick={() =>
          onToggleStatus(user)
        }
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all"
        style={{
          color:
            user.status === "active"
              ? "var(--danger)"
              : "var(--success)",
          backgroundColor:
            "transparent",
          border: "none",
          cursor:
            roleLoading ||
            statusLoading ||
            deleteLoading
              ? "not-allowed"
              : "pointer",
          opacity:
            statusLoading ? 0.6 : 1,
        }}
      >
        {statusLoading ? (
          <Loader2
            size={15}
            className="shrink-0 animate-spin"
          />
        ) : user.status === "active" ? (
          <UserX
            size={15}
            className="shrink-0"
          />
        ) : (
          <UserCheck
            size={15}
            className="shrink-0"
          />
        )}

        <span className="whitespace-nowrap">
          {user.status === "active"
            ? "Deactivate User"
            : "Activate User"}
        </span>
      </button>

      {/* ==================================================
          DIVIDER
      ================================================== */}

      <div
        className="my-2 border-t"
        style={{
          borderColor:
            "var(--border)",
        }}
      />

      {/* ==================================================
          DELETE
      ================================================== */}

      <button
        type="button"
        disabled={
          roleLoading ||
          statusLoading ||
          deleteLoading
        }
        onClick={() =>
          onDelete(user)
        }
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all"
        style={{
          color: "var(--danger)",
          backgroundColor:
            "transparent",
          border: "none",
          cursor:
            roleLoading ||
            statusLoading ||
            deleteLoading
              ? "not-allowed"
              : "pointer",
          opacity:
            deleteLoading ? 0.6 : 1,
        }}
      >
        {deleteLoading ? (
          <Loader2
            size={15}
            className="shrink-0 animate-spin"
          />
        ) : (
          <Trash2
            size={15}
            className="shrink-0"
          />
        )}

        <span className="whitespace-nowrap">
          Delete Account
        </span>
      </button>
    </div>
  );

  return createPortal(
    menu,
    document.body
  );
}

/* ============================================================
   ROLE SUMMARY
============================================================ */

function RoleSummary({
  role,
  description,
  count,
  icon,
}) {
  return (
    <div className="foodchow-card flex items-center gap-4 p-5">
      <div
        className="rounded-xl p-3"
        style={{
          backgroundColor:
            "var(--primary-soft)",
          color: "var(--primary)",
        }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3
            className="font-semibold"
            style={{
              color:
                "var(--text-strong)",
            }}
          >
            {role}
          </h3>

          <span
            className="text-xl font-bold"
            style={{
              color:
                "var(--text-strong)",
            }}
          >
            {count}
          </span>
        </div>

        <p
          className="mt-1 text-xs"
          style={{
            color: "var(--muted)",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   CREATE USER MODAL
============================================================ */

function CreateUserModal({
  onClose,
  onCreate,
  loading,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [role, setRole] =
    useState("support_agent");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return;
    }

    await onCreate({
      name: name.trim(),
      email: email
        .trim()
        .toLowerCase(),
      password,
      role,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      style={{
        backgroundColor:
          "rgba(0, 0, 0, 0.45)",
      }}
      onMouseDown={onClose}
    >
      <div
        className="my-auto w-full max-w-md rounded-2xl border p-6 shadow-2xl"
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
        <div className="flex items-start justify-between">
          <div>
            <h2
              className="text-lg font-semibold"
              style={{
                color:
                  "var(--text-strong)",
              }}
            >
              Add New User
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--muted)",
              }}
            >
              Create a new FoodChow
              platform user.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2"
            style={{
              color: "var(--muted)",
              backgroundColor:
                "var(--surface-soft)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          {/* Name */}

          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{
                color: "var(--text)",
              }}
            >
              Full Name
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter full name"
              required
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor:
                  "var(--surface-soft)",
                borderColor:
                  "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          {/* Email */}

          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{
                color: "var(--text)",
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="user@foodchow.com"
              required
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor:
                  "var(--surface-soft)",
                borderColor:
                  "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          {/* Password */}

          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{
                color: "var(--text)",
              }}
            >
              Temporary Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Minimum 6 characters"
              minLength={6}
              required
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor:
                  "var(--surface-soft)",
                borderColor:
                  "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          {/* Role */}

          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{
                color: "var(--text)",
              }}
            >
              Role
            </label>

            <select
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value
                )
              }
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor:
                  "var(--surface-soft)",
                borderColor:
                  "var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="support_agent">
                Support Agent
              </option>

              <option value="viewer">
                Viewer
              </option>

              <option value="admin">
                Admin
              </option>
            </select>
          </div>

          {/* Security notice */}

          <div
            className="rounded-xl border p-3 text-xs leading-5"
            style={{
              backgroundColor:
                "var(--primary-soft)",
              borderColor:
                "var(--border)",
              color: "var(--muted)",
            }}
          >
            <CheckCircle2
              size={15}
              className="mr-1 inline"
              style={{
                color:
                  "var(--primary)",
              }}
            />

            Passwords are securely
            hashed by the backend
            before being stored in
            MongoDB.
          </div>

          {/* Buttons */}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
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
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !name.trim() ||
                !email.trim() ||
                password.length < 6
              }
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{
                backgroundColor:
                  "var(--primary)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                opacity:
                  loading ||
                  !name.trim() ||
                  !email.trim() ||
                  password.length < 6
                    ? 0.6
                    : 1,
              }}
            >
              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Creating..."
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUsers;