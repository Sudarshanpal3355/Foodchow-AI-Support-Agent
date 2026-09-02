import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import logo from "../assets/foodchow-logo.png";


function Signup() {
  const navigate = useNavigate();

  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "support_agent",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.password) {
      setError("Please enter a password.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1000);

    } catch (err) {
      console.error("Signup failed:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to create your account. Please try again.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to create your account. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#07111f] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* LOGO */}

        <div className="flex justify-center mb-8">
          <img
            src={logo}
            alt="FoodChow"
            className="h-14 w-auto object-contain"
          />
        </div>


        {/* CARD */}

        <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-7 shadow-2xl backdrop-blur-xl">

          <div className="mb-7">

            <h1 className="text-2xl font-semibold text-white">
              Create your account
            </h1>

            <p className="text-sm text-white/50 mt-2">
              Create an account for your FoodChow Support workspace.
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3">

              <p className="text-sm text-red-300">
                {error}
              </p>

            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="mb-5 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3">

              <p className="text-sm text-green-300">
                {success}
              </p>

            </div>
          )}


          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAME */}

            <div>

              <label
                htmlFor="name"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/10"
              />

            </div>


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
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/10"
              />

            </div>


            {/* ROLE */}

            <div>

              <label
                htmlFor="role"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Account role
              </label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-4 py-3 text-white outline-none transition focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/10"
              >

                <option value="support_agent">
                  Support Agent
                </option>

                <option value="viewer">
                  Viewer
                </option>

              </select>

              <p className="text-xs text-white/35 mt-2">
                Administrator accounts are created separately.
              </p>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>


          {/* LOGIN LINK */}

          <div className="mt-7 text-center">

            <p className="text-sm text-white/45">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-medium text-orange-400 hover:text-orange-300"
              >
                Sign in
              </Link>

            </p>

          </div>

        </div>


        <p className="text-center text-xs text-white/25 mt-6">
          FoodChow AI Support Agent
        </p>

      </div>

    </div>
  );
}


export default Signup;