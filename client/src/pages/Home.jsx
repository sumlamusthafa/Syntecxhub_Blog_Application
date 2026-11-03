import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/auth-context.js";
import PostCard from "../components/PostCard.jsx";

const PAGE_SIZE = 6;

export default function Home() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState({ key: "", data: null, error: "" });

  // Wait a moment after typing before searching
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const key = `${query}|${page}|${reload}`;

  useEffect(() => {
    let active = true;
    api
      .listPosts({ page, limit: PAGE_SIZE, search: query })
      .then((data) => {
        if (active) setResult({ key, data, error: "" });
      })
      .catch((err) => {
        if (active) setResult({ key, data: null, error: err.message });
      });
    return () => {
      active = false;
    };
  }, [key, page, query]);

  const loading = result.key !== key;
  const data = result.data;
  const posts = data?.posts ?? [];

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Inkwell</p>
        <h1>Stories worth writing down.</h1>
        <p className="hero-sub">
          Read what others are writing, or put your own thoughts on the page with a
          full rich text editor and images.
        </p>
        <div className="hero-actions">
          <Link to={user ? "/write" : "/register"} className="btn btn-primary">
            {user ? "Write a post" : "Start writing"}
          </Link>
          <div className="search">
            <label htmlFor="search" className="sr-only">
              Search posts
            </label>
            <input
              id="search"
              type="search"
              placeholder="Search posts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="section-head">
        <h2>{query ? `Results for “${query}”` : "Latest posts"}</h2>
        {data && <span className="muted">{data.total} {data.total === 1 ? "post" : "posts"}</span>}
      </div>

      {result.error && !loading ? (
        <div className="banner banner-error" role="alert">
          {result.error}{" "}
          <button type="button" className="link-button" onClick={() => setReload((n) => n + 1)}>
            Try again
          </button>
        </div>
      ) : (
        <div className={`grid${loading ? " is-loading" : ""}`} aria-busy={loading}>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {!loading && !result.error && posts.length === 0 && (
        <p className="empty">
          {query ? (
            "No posts match your search."
          ) : (
            <>
              <strong>No posts yet.</strong>
              <span>Be the first to write one.</span>
            </>
          )}
        </p>
      )}

      {data && data.totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Previous
          </button>
          <span className="muted">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages || loading}
          >
            Next
          </button>
        </nav>
      )}
    </>
  );
}
