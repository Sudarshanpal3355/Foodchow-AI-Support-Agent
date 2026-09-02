import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Lock,
  Save,
  ShieldCheck,
  Users,
  UserCog,
} from "lucide-react";

const ROLE_DATA = {
  admin: {
    name: "Admin",
    description: "Full platform administration and system control.",
    icon: <ShieldCheck size={22} />,
  },
  support_agent: {
    name: "Support Agent",
    description: "Customer support, diagnostics and ticket operations.",
    icon: <UserCog size={22} />,
  },
  viewer: {
    name: "Viewer",
    description: "Read-only access to support and analytics information.",
    icon: <Users size={22} />,
  },
};

const PERMISSIONS = [
  {
    id: "dashboard_view",
    name: "Dashboard",
    description: "View the main support dashboard.",
  },
  {
    id: "support_chat",
    name: "Support Chat",
    description: "Use the AI support assistant.",
  },
  {
    id: "diagnostics",
    name: "Diagnostics",
    description: "Run POS, KDS, printer and payment diagnostics.",
  },
  {
    id: "conversation_view",
    name: "Conversations",
    description: "View customer support conversations.",
  },
  {
    id: "ticket_view",
    name: "Ticket View",
    description: "View support tickets and ticket details.",
  },
  {
    id: "ticket_manage",
    name: "Ticket Management",
    description: "Create, update and manage support tickets.",
  },
  {
    id: "knowledge_view",
    name: "Knowledge Base",
    description: "View FoodChow support knowledge.",
  },
  {
    id: "knowledge_manage",
    name: "Knowledge Management",
    description: "Create and manage knowledge content.",
  },
  {
    id: "analytics_view",
    name: "Analytics",
    description: "View support analytics and performance data.",
  },
  {
    id: "settings_view",
    name: "Settings",
    description: "View application settings.",
  },
  {
    id: "human_handoff",
    name: "Human Handoff",
    description: "Escalate conversations to human support.",
  },
  {
    id: "user_management",
    name: "User Management",
    description: "Manage users and account access.",
  },
  {
    id: "approval_management",
    name: "Approval Management",
    description: "Approve or reject access requests.",
  },
];

const INITIAL_PERMISSIONS = {
  admin: PERMISSIONS.reduce(
    (permissions, permission) => ({
      ...permissions,
      [permission.id]: true,
    }),
    {}
  ),

  support_agent: {
    dashboard_view: true,
    support_chat: true,
    diagnostics: true,
    conversation_view: true,
    ticket_view: true,
    ticket_manage: true,
    knowledge_view: true,
    knowledge_manage: false,
    analytics_view: true,
    settings_view: true,
    human_handoff: true,
    user_management: false,
    approval_management: false,
  },

  viewer: {
    dashboard_view: true,
    support_chat: false,
    diagnostics: false,
    conversation_view: true,
    ticket_view: true,
    ticket_manage: false,
    knowledge_view: true,
    knowledge_manage: false,
    analytics_view: true,
    settings_view: true,
    human_handoff: false,
    user_management: false,
    approval_management: false,
  },
};

function AdminRoles() {
  const [selectedRole, setSelectedRole] = useState("admin");
  const [permissions, setPermissions] = useState(
    INITIAL_PERMISSIONS
  );
  const [saved, setSaved] = useState(false);

  const selectedPermissions =
    permissions[selectedRole] || {};

  const enabledCount = useMemo(
    () =>
      Object.values(selectedPermissions).filter(Boolean).length,
    [selectedPermissions]
  );

  const togglePermission = (permissionId) => {
    if (selectedRole === "admin") {
      return;
    }

    setSaved(false);

    setPermissions((current) => ({
      ...current,
      [selectedRole]: {
        ...current[selectedRole],
        [permissionId]:
          !current[selectedRole][permissionId],
      },
    }));
  };

  const enableAll = () => {
    if (selectedRole === "admin") {
      return;
    }

    setSaved(false);

    const allEnabled = PERMISSIONS.reduce(
      (result, permission) => ({
        ...result,
        [permission.id]: true,
      }),
      {}
    );

    setPermissions((current) => ({
      ...current,
      [selectedRole]: allEnabled,
    }));
  };

  const disableAll = () => {
    if (selectedRole === "admin") {
      return;
    }

    setSaved(false);

    const allDisabled = PERMISSIONS.reduce(
      (result, permission) => ({
        ...result,
        [permission.id]: false,
      }),
      {}
    );

    setPermissions((current) => ({
      ...current,
      [selectedRole]: allDisabled,
    }));
  };

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
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

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div
                className="mb-2 flex items-center gap-2 text-sm"
                style={{
                  color: "var(--primary)",
                }}
              >
                <ShieldCheck size={16} />
                Administration
              </div>

              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  color: "var(--text-strong)",
                }}
              >
                Roles & Permissions
              </h1>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--muted)",
                }}
              >
                Control what each FoodChow platform role can access.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{
                backgroundColor: saved
                  ? "var(--success)"
                  : "var(--primary)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={17} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Permissions
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Role selector */}
          <aside>
            <div className="foodchow-card p-4">
              <div className="mb-3 px-2">
                <h2
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--text-strong)",
                  }}
                >
                  Platform Roles
                </h2>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  Select a role to manage access.
                </p>
              </div>

              <div className="space-y-2">
                {Object.entries(ROLE_DATA).map(
                  ([roleId, role]) => {
                    const isSelected =
                      selectedRole === roleId;

                    const roleEnabledCount = Object.values(
                      permissions[roleId]
                    ).filter(Boolean).length;

                    return (
                      <button
                        key={roleId}
                        type="button"
                        onClick={() => {
                          setSelectedRole(roleId);
                          setSaved(false);
                        }}
                        className="w-full rounded-xl border p-4 text-left transition-all duration-200"
                        style={{
                          backgroundColor: isSelected
                            ? "var(--primary-soft)"
                            : "var(--surface)",
                          borderColor: isSelected
                            ? "var(--primary)"
                            : "var(--border)",
                          color: "var(--text)",
                          cursor: "pointer",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="rounded-lg p-2"
                            style={{
                              backgroundColor:
                                isSelected
                                  ? "var(--surface)"
                                  : "var(--surface-soft)",
                              color: "var(--primary)",
                            }}
                          >
                            {role.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className="font-semibold"
                                style={{
                                  color:
                                    "var(--text-strong)",
                                }}
                              >
                                {role.name}
                              </p>

                              <span
                                className="text-xs font-medium"
                                style={{
                                  color: "var(--primary)",
                                }}
                              >
                                {roleEnabledCount}/
                                {PERMISSIONS.length}
                              </span>
                            </div>

                            <p
                              className="mt-1 text-xs leading-5"
                              style={{
                                color: "var(--muted)",
                              }}
                            >
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </aside>

          {/* Permissions */}
          <section>
            <div className="foodchow-card overflow-hidden">
              <div
                className="border-b px-6 py-5"
                style={{
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-xl p-2.5"
                        style={{
                          backgroundColor:
                            "var(--primary-soft)",
                          color: "var(--primary)",
                        }}
                      >
                        {ROLE_DATA[selectedRole].icon}
                      </div>

                      <div>
                        <h2
                          className="text-lg font-semibold"
                          style={{
                            color: "var(--text-strong)",
                          }}
                        >
                          {ROLE_DATA[selectedRole].name}
                        </h2>

                        <p
                          className="mt-0.5 text-sm"
                          style={{
                            color: "var(--muted)",
                          }}
                        >
                          {ROLE_DATA[selectedRole].description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-xl px-4 py-3"
                    style={{
                      backgroundColor:
                        "var(--surface-soft)",
                    }}
                  >
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--muted)",
                      }}
                    >
                      Permissions enabled
                    </p>

                    <p
                      className="mt-0.5 text-xl font-bold"
                      style={{
                        color: "var(--text-strong)",
                      }}
                    >
                      {enabledCount}
                      <span
                        className="ml-1 text-sm font-medium"
                        style={{
                          color: "var(--muted)",
                        }}
                      >
                        / {PERMISSIONS.length}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={enableAll}
                    disabled={selectedRole === "admin"}
                    className="rounded-lg border px-3 py-2 text-xs font-medium"
                    style={{
                      backgroundColor:
                        "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                      opacity:
                        selectedRole === "admin"
                          ? 0.5
                          : 1,
                      cursor:
                        selectedRole === "admin"
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Enable All
                  </button>

                  <button
                    type="button"
                    onClick={disableAll}
                    disabled={selectedRole === "admin"}
                    className="rounded-lg border px-3 py-2 text-xs font-medium"
                    style={{
                      backgroundColor:
                        "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                      opacity:
                        selectedRole === "admin"
                          ? 0.5
                          : 1,
                      cursor:
                        selectedRole === "admin"
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Disable All
                  </button>
                </div>
              </div>

              {/* Admin notice */}
              {selectedRole === "admin" && (
                <div
                  className="m-5 flex gap-3 rounded-xl border p-4"
                  style={{
                    backgroundColor:
                      "var(--primary-soft)",
                    borderColor:
                      "rgba(10, 168, 158, 0.25)",
                  }}
                >
                  <Lock
                    size={18}
                    className="mt-0.5 shrink-0"
                    style={{
                      color: "var(--primary)",
                    }}
                  />

                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: "var(--text-strong)",
                      }}
                    >
                      Administrator permissions
                    </p>

                    <p
                      className="mt-1 text-xs leading-5"
                      style={{
                        color: "var(--muted)",
                      }}
                    >
                      Administrators have full platform
                      permissions. Individual Admin permissions
                      are locked to prevent accidental removal
                      of system access.
                    </p>
                  </div>
                </div>
              )}

              {/* Permission list */}
              <div className="divide-y">
                {PERMISSIONS.map((permission) => {
                  const enabled =
                    selectedPermissions[
                      permission.id
                    ] === true;

                  const locked =
                    selectedRole === "admin";

                  return (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between gap-5 px-6 py-4"
                      style={{
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="min-w-0">
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: "var(--text-strong)",
                          }}
                        >
                          {permission.name}
                        </p>

                        <p
                          className="mt-1 text-xs leading-5"
                          style={{
                            color: "var(--muted)",
                          }}
                        >
                          {permission.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          togglePermission(
                            permission.id
                          )
                        }
                        disabled={locked}
                        aria-label={`Toggle ${permission.name}`}
                        className="relative h-7 w-12 shrink-0 rounded-full transition-all duration-200"
                        style={{
                          backgroundColor: enabled
                            ? "var(--primary)"
                            : "var(--border)",
                          border: "none",
                          cursor: locked
                            ? "not-allowed"
                            : "pointer",
                          opacity: locked ? 0.8 : 1,
                        }}
                      >
                        <span
                          className="absolute top-1 h-5 w-5 rounded-full transition-all duration-200"
                          style={{
                            left: enabled
                              ? "24px"
                              : "4px",
                            backgroundColor:
                              "#ffffff",
                            boxShadow:
                              "0 1px 4px rgba(0,0,0,0.18)",
                          }}
                        />

                        {enabled && (
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
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Role comparison */}
        <section className="mt-8">
          <div className="mb-4">
            <h2
              className="text-base font-semibold"
              style={{
                color: "var(--text-strong)",
              }}
            >
              Role Comparison
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--muted)",
              }}
            >
              Quick overview of access across platform roles.
            </p>
          </div>

          <div className="foodchow-card overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead
                style={{
                  backgroundColor:
                    "var(--surface-soft)",
                }}
              >
                <tr>
                  <th
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: "var(--muted)",
                    }}
                  >
                    Permission
                  </th>

                  {Object.entries(ROLE_DATA).map(
                    ([roleId, role]) => (
                      <th
                        key={roleId}
                        className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: "var(--muted)",
                        }}
                      >
                        {role.name}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {PERMISSIONS.map((permission) => (
                  <tr
                    key={permission.id}
                    className="border-t"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <td
                      className="px-5 py-3 text-sm"
                      style={{
                        color: "var(--text)",
                      }}
                    >
                      {permission.name}
                    </td>

                    {Object.keys(ROLE_DATA).map(
                      (roleId) => (
                        <td
                          key={roleId}
                          className="px-5 py-3 text-center"
                        >
                          {permissions[roleId][
                            permission.id
                          ] ? (
                            <CheckCircle2
                              size={17}
                              className="mx-auto"
                              style={{
                                color:
                                  "var(--success)",
                              }}
                            />
                          ) : (
                            <span
                              className="text-sm"
                              style={{
                                color:
                                  "var(--muted-light)",
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
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
              backgroundColor: "var(--primary-soft)",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            User Management
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AdminRoles;