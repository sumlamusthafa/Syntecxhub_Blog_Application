import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/auth-context.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { formatDate } from "../format.js";

const PAGE_SIZE = 8;

export default function MyPosts() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState({ key: "", data: null, error: "" });
  const [notice, setNotice] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const key = `${page}|${reload}`;

  useEffect(() => {
    let active = true;
    api
      .listPosts({ page, limit: PAGE_SIZE, author: user.id })
      .then((data) => {
        if (active) setResult({ key, data, error: "" });
      })
      .catch((err) => {
        if (active) setResult({ key, data: null, error: err.message });
      });
    return () => {
      active = false;
    };
  }, [key, page, user.id]);

  const loading = result.key !== key;
  const data = result.data;
  const posts = data?.posts ?? [];

  async function confirmDelete() {
    const target = pendingDelete;
    setDeleting(true);
    try {
      await api.deletePost(target.id);
      setNotice({ type: "success", text: `“${target.title}” was deleted.` });
      if (posts.length === 1 && page > 1) setPage((p) => p - 1);
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    }
    setDeleting(false);
    setPendingDelete(null);
    setReload((n) => n + 1);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My posts</h1>
          <p className="muted">
            {data ? `${data.total} ${data.total === 1 ? "post" : "posts"}` : "Loading…"}
          </p>
        </div>
        <Link to="/write" className="btn btn-primary">
          Write a post
        </Link>
      </div>

      {notice && (
        <div className={`banner banner-${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
          {notice.text}
        </div>
      )}

      {result.error && !loading ? (
        <div className="banner banner-error" role="alert">
          {result.error}
        </div>
      ) : (
        <ul className={`rows${loading ? " is-loading" : ""}`} aria-busy={loading}>
          {posts.map((p) => (
            <li key={p.id} className="row">
              <div className="row-main">
                <Link to={`/posts/${p.id}`} className="row-title">
                  {p.title}
                </Link>
                <span className="muted">{formatDate(p.createdAt)}</span>
              </div>
              <div className="row-actions">
                <Link to={`/posts/${p.id}/edit`} className="btn btn-quiet btn-sm" aria-label={`Edit “${p.title}”`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger-outline btn-sm"
                  onClick={() => setPendingDelete(p)}
                  aria-label={`Delete “${p.title}”`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {!loading && posts.length === 0 && (
            <li className="empty">
              <strong>You haven't written anything yet.</strong>
              <Link to="/write">Write your first post</Link>
            </li>
          )}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button type="button" className="btn btn-quiet" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this post?"
        message={pendingDelete ? `“${pendingDelete.title}” will be removed permanently.` : ""}
        confirmLabel="Delete post"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
