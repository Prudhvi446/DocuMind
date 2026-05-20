import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/documents", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError("");
    setLoading(true);
    try {
      await register(email, password, name);
      navigate("/documents");
    } catch (err) {
      const data = err.response?.data;
      if (data?.details) {
        setFieldErrors(data.details);
      } else {
        setFormError(data?.error || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 card-hover shadow-xl">
        <h1 className="font-display text-2xl font-bold text-center mb-1">
          DocuMind
        </h1>
        <p className="text-text-muted text-sm text-center mb-8">
          Create your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-base border border-border text-text-primary text-sm"
              required
            />
            {fieldErrors.name && (
              <p className="text-error text-xs mt-1">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-base border border-border text-text-primary text-sm"
              required
            />
            {fieldErrors.email && (
              <p className="text-error text-xs mt-1">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-base border border-border text-text-primary text-sm"
              required
              minLength={8}
            />
            {fieldErrors.password && (
              <p className="text-error text-xs mt-1">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          {formError && <p className="text-error text-sm">{formError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-accent text-white font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:text-accent-hover">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
