import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/api";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const response = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const { token, ...userData } = response.data;

      // Save user and token automatically
      login(userData, token);

      // Redirect based on role
      if (userData.role === "farmer") {
        navigate("/dashboard/farmer");
      } else if (userData.role === "buyer") {
        navigate("/dashboard/buyer");
      } else {
        navigate("/dashboard/admin");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    border: "1px solid #D8F3DC",
    background: "#F8F4EE",
    color: "#1A1A1A",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
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
            Create your FarmConnect account
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
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#FEE2E2", color: "#991B1B" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#1B4332" }}
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="e.g. chanda_farmer"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "1px solid #40916C")}
                onBlur={(e) => (e.target.style.border = "1px solid #D8F3DC")}
              />
            </div>

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
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "1px solid #40916C")}
                onBlur={(e) => (e.target.style.border = "1px solid #D8F3DC")}
              />
            </div>

            {/* Role */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#1B4332" }}
              >
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "buyer" })}
                  className="py-3 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background:
                      formData.role === "buyer" ? "#1B4332" : "#F8F4EE",
                    color: formData.role === "buyer" ? "#fff" : "#1B4332",
                    border: "1px solid #D8F3DC",
                  }}
                >
                  🛒 Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "farmer" })}
                  className="py-3 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background:
                      formData.role === "farmer" ? "#1B4332" : "#F8F4EE",
                    color: formData.role === "farmer" ? "#fff" : "#1B4332",
                    border: "1px solid #D8F3DC",
                  }}
                >
                  🌱 Farmer
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#1B4332" }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "1px solid #40916C")}
                onBlur={(e) => (e.target.style.border = "1px solid #D8F3DC")}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "#1B4332" }}
              >
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "1px solid #40916C")}
                onBlur={(e) => (e.target.style.border = "1px solid #D8F3DC")}
              />
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm mt-6" style={{ color: "#666" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#40916C", fontWeight: 600 }}>
              Sign in
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
