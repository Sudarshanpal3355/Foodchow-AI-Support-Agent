import api from "./api";

/**
 * FoodChow Admin API
 *
 * Authentication token handling is managed
 * automatically by the configured Axios instance.
 */

// ============================================================
// USERS
// ============================================================

export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", {
    params,
  });

  return response.data;
};

export const createAdminUser = async (userData) => {
  const response = await api.post(
    "/admin/users",
    userData
  );

  return response.data;
};

export const updateAdminUser = async (
  userId,
  userData
) => {
  const response = await api.patch(
    `/admin/users/${userId}`,
    userData
  );

  return response.data;
};

export const deleteAdminUser = async (
  userId
) => {
  const response = await api.delete(
    `/admin/users/${userId}`
  );

  return response.data;
};


// ============================================================
// AUDIT LOGS
// ============================================================

export const getAuditLogs = async (
  params = {}
) => {
  const response = await api.get(
    "/admin/audit-logs",
    {
      params,
    }
  );

  return response.data;
};


// ============================================================
// SYSTEM SETTINGS
// ============================================================

export const getSystemSettings = async () => {
  const response = await api.get(
    "/admin/settings"
  );

  return response.data;
};

export const updateSystemSettings = async (
  settings
) => {
  const response = await api.put(
    "/admin/settings",
    {
      settings,
    }
  );

  return response.data;
};


// ============================================================
// INTEGRATIONS
// ============================================================

/**
 * Check one integration.
 *
 * Backend:
 * GET /admin/integrations/check/{integration_name}
 */
export const checkIntegration = async (
  integrationName
) => {
  const response = await api.get(
    `/admin/integrations/check/${encodeURIComponent(
      integrationName
    )}`
  );

  return response.data;
};


/**
 * Check multiple integrations.
 *
 * This calls the real backend endpoint
 * for every integration.
 */
export const checkAllIntegrations = async (
  integrationNames
) => {
  const results =
    await Promise.allSettled(
      integrationNames.map(
        (name) =>
          checkIntegration(name)
      )
    );

  return results.map(
    (result, index) => {
      if (
        result.status ===
        "fulfilled"
      ) {
        return result.value;
      }

      return {
        name:
          integrationNames[index],
        status: "error",
        latency_ms: null,
        message:
          result.reason?.response
            ?.data?.detail ||
          result.reason?.message ||
          "Integration check failed.",
        checked_at:
          new Date().toISOString(),
      };
    }
  );
};