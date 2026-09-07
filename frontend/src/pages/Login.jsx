import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import logo from "../assets/foodchow-logo.png";


function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const {
    login,
  } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await login(
        form.email.trim(),
        form.password
      );

      navigate(redirectPath === "/admin" ? "/admin" : "/", {
        replace: true,
      });

    } catch (err) {
      console.error("Login failed:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to sign in. Please check your credentials.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to sign in. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#07111f] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* ==================================================
            BRAND
            ================================================== */}

        <div className="flex justify-center mb-8">

          <img
            src={logo}
            alt="FoodChow"
            className="h-14 w-auto object-contain"
          />

        </div>


        {/* ==================================================
            LOGIN CARD
            ================================================== */}

        <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-7 shadow-2xl backdrop-blur-xl">

          <div className="mb-7">

            <h1 className="text-2xl font-semibold text-white">
              Welcome back
            </h1>

            <p className="text-sm text-white/50 mt-2">
              Sign in to your FoodChow Support workspace.
            </p>

          </div>


          {/* ==================================================
              ERROR
              ================================================== */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3">

              <p className="text-sm text-red-300">
                {error}
              </p>

            </div>
          )}


          {/* ==================================================
              FORM
              ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/10"
              />

            </div>


            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/10"
              />

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading
                ? "Signing in..."
                : "Sign in"
              }

            </button>

          </form>


          {/* ==================================================
              SIGNUP
              ================================================== */}

          <div className="mt-7 text-center">

            <p className="text-sm text-white/45">

              Don't have an account?{" "}

              <Link
                to="/signup"
                className="font-medium text-orange-400 hover:text-orange-300"
              >
                Create one
              </Link>

            </p>

          </div>

        </div>


        {/* ==================================================
            FOOTER
            ================================================== */}

        <p className="text-center text-xs text-white/25 mt-6">
          FoodChow AI Support Agent
        </p>

      </div>

    </div>
  );
}


export default Login;