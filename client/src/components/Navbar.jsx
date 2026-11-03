import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/auth-context.js";
import Avatar from "./Avatar.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="wordmark">
          Inkwell
          <span className="wordmark-dot" aria-hidden="true" />
        </Link>

        <nav className="topnav" aria-label="Main">
          <NavLink to="/" end>
            Read
          </NavLink>
          {user && <NavLink to="/my-posts">My posts</NavLink>}
        </nav>

        {user ? (
          <div className="topbar-user">
            <Link to="/write" className="btn btn-primary btn-sm">
              Write
            </Link>
            <Avatar name={user.name} size="sm" />
            <span className="topbar-name">{user.name}</span>
            <button type="button" className="btn btn-quiet btn-sm" onClick={logout}>
              Sign out
            </button>
          </div>
        ) : (
          <div className="topbar-user">
            <Link to="/login" className="btn btn-quiet btn-sm">
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
