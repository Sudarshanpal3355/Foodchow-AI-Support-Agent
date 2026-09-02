import api from "./api";

/**
 * Authentication API
 *
 * Backend endpoints expected:
 * POST /auth/login
 * POST /auth/signup
 * GET  /auth/me
 */
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const signupUser = async (userData) => {
  const response = await api.post("/auth/signup", userData);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};