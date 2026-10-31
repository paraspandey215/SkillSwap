
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!API_URL) {
      setMessage("Server configuration is missing. Please contact support.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "login" : "register";

      const response = await fetch(
        `${API_URL}/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isLogin
              ? { email, password }
              : { name, email, password, role }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onAuthSuccess(data.user);
      } else {
        setMessage("Account created successfully! Please login.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage(
        error.message || "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1120] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111827] p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Skill<span className="text-blue-500">Swap</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Learn together. Grow together.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setMessage("");
            }}
            className={`rounded-md py-2 text-sm font-medium ${
              isLogin
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setMessage("");
            }}
            className={`rounded-md py-2 text-sm font-medium ${
              !isLogin
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        <h2 className="mb-2 text-2xl font-semibold text-white">
          {isLogin ? "Welcome Back!" : "Create Account"}
        </h2>

        <p className="mb-6 text-sm text-slate-400">
          {isLogin
            ? "Login to continue to your SkillSwap dashboard."
            : "Join SkillSwap and start exchanging skills."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="mb-1 block text-sm text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">
                  Select Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              maxLength={150}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={8}
              maxLength={72}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {message && (
            <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login to SkillSwap"
              : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          SkillSwap – Micro-Mentorship & Skill Exchange Hub
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
