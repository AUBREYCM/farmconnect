import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      const { token, ...userData } = response.data;
      login(userData, token);

      if (userData.role === "farmer") {
        navigate("/dashboard/farmer");
      } else if (userData.role === "buyer") {
        navigate("/dashboard/buyer");
      } else if (userData.role === "admin") {
        navigate("/dashboard/admin");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F8F4EE" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#1B4332" />
              <path
                d="M8 20 C8 20 10 12 14 10 C18 8 20 14 20 14"
                stroke="#D8F3DC"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M14 10 L14 20"
                stroke="#A67C52"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.4rem",
                color: "#1B4332",
                fontWeight: 600,
              }}
            >
              FarmConnect
            </span>
          </div>
          <p style={{ color: "#666", fontSize: "0.95rem" }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{
            background: "#fff",
            border: "1px solid #D8F3DC",
            boxShadow: "0 4px 24px rgba(27,67,50,0.07)",
          }}
        >
          {/* Error message */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#FEE2E2", color: "#991B1B" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#1B4332" }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: "1px solid #D8F3DC",
                  background: "#F8F4EE",
                  color: "#1A1A1A",
                }}
                onFocus={(e) => (e.target.style.border = "1px solid #40916C")}
                onBlur={(e) => (e.target.style.border = "1px solid #D8F3DC")}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#1B4332" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={{
                    border: "1px solid #D8F3DC",
                    background: "#F8F4EE",
                    color: "#1A1A1A",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid #40916C")}
                  onBlur={(e) => (e.target.style.border = "1px solid #D8F3DC")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "#7A7A6E" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all"
              style={{
                background: loading ? "#40916C" : "#1B4332",
                color: "#fff",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm mt-6" style={{ color: "#666" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#40916C", fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center text-sm mt-4">
          <Link to="/" style={{ color: "#A67C52" }}>
            ← Back to FarmConnect
          </Link>
        </p>
      </div>
    </div>
  );
}
