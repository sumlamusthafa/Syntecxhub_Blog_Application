import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context.js";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function validate(mode, { name, email, password }) {
  const errors = {};
  if (mode === "register" && (name.trim().length < 2 || name.trim().length > 50)) {
    errors.name = "Enter a name between 2 and 50 characters.";
  }
  if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
  if (mode === "register" ? password.length < 6 : password.length === 0) {
    errors.password = mode === "register" ? "Use at least 6 characters." : "Enter your password.";
  }
  return errors;
}

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, loading, login, register } = useAuth();
  const location = useLocation();

  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <div className="screen-center" role="status">
        Loading your session…
      </div>
    );
  }
  if (user) return <Navigate to={location.state?.from?.pathname || "/"} replace />;

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
    setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(mode, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      if (isRegister) await register(values.name.trim(), values.email.trim(), values.password);
      else await login(values.email.trim(), values.password);
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <Link to="/" className="wordmark wordmark-light">
          Inkwell
          <span className="wordmark-dot" aria-hidden="true" />
        </Link>
        <div className="auth-pitch">
          <h1>Write it down. Put it out there.</h1>
          <p>
            Publish posts with headings, lists, quotes, links and images. Edit or
            delete them any time. Only you can change your own writing.
          </p>
        </div>
        <blockquote className="auth-quote" aria-hidden="true">
          “Start writing, no matter what. The water does not flow until the faucet is turned on.”
          <cite>Louis L'Amour</cite>
        </blockquote>
      </aside>

      <main className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2>{isRegister ? "Create your account" : "Sign in"}</h2>
          <p className="auth-sub">
            {isRegister ? "Create an account to start writing." : "Welcome back. Sign in to write and manage your posts."}
          </p>

          {serverError && (
            <div className="banner banner-error" role="alert">
              {serverError}
            </div>
          )}

          {isRegister && (
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={values.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting
              ? isRegister
                ? "Creating account…"
                : "Signing in…"
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>

          <p className="auth-switch">
            {isRegister ? (
              <>
                Already have an account? <Link to="/login">Sign in</Link>
              </>
            ) : (
              <>
                New here? <Link to="/register">Create an account</Link>
              </>
            )}
          </p>
        </form>
      </main>
    </div>
  );
}
