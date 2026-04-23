"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Unable to create account. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-card">
      {/* Purple blob top-right */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <div className="auth-content">
        <h1 className="auth-title" style={{ marginBottom: "28px" }}>Sign up</h1>

        {success ? (
          <div className="auth-success">
            <p>✓ Account created! Redirecting to login…</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Name</label>
              <div className="auth-input-wrap">
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <input
                  type="email"
                  className="auth-input"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-input-icon auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="auth-input"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-input-icon auth-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <p>{error}</p>
              </div>
            )}

            <button type="submit" className="auth-btn-solid w-full" disabled={pending}>
              {pending ? "Creating account…" : "Sign Up"}
            </button>

            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <Link href="/login" className="auth-link" style={{ fontSize: "0.85rem" }}>
                I am already a member
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
