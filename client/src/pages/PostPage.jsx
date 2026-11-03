import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/auth-context.js";
import Avatar from "../components/Avatar.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { formatDate, readingTime } from "../format.js";

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [result, setResult] = useState({ id: "", post: null, error: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .getPost(id)
      .then((data) => {
        if (active) setResult({ id, post: data.post, error: "" });
      })
      .catch((err) => {
        if (active) setResult({ id, post: null, error: err.message });
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deletePost(id);
      navigate("/my-posts", { replace: true });
    } catch (err) {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteError(err.message);
    }
  }

  if (result.id !== id) {
    return (
      <p className="muted" role="status">
        Loading post…
      </p>
    );
  }
  if (result.error) {
    return (
      <div className="empty">
        <strong>{result.error}</strong>
        <Link to="/">Back to all posts</Link>
      </div>
    );
  }

  const post = result.post;
  const isAuthor = user && post.author && String(post.author.id) === String(user.id);

  return (
    <article className="article">
      <Link to="/" className="back">
        ← All posts
      </Link>
      <h1 className="article-title">{post.title}</h1>
      <div className="byline">
        <Avatar name={post.author?.name} size="sm" />
        <span>
          <strong>{post.author?.name ?? "Unknown"}</strong>
          <span className="muted">
            {" "}
            · {formatDate(post.createdAt)} · {readingTime(post.content)} min read
          </span>
        </span>
        {isAuthor && (
          <span className="byline-actions">
            <Link to={`/posts/${post.id}/edit`} className="btn btn-quiet btn-sm">
              Edit
            </Link>
            <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setConfirmOpen(true)}>
              Delete
            </button>
          </span>
        )}
      </div>

      {deleteError && (
        <div className="banner banner-error" role="alert">
          {deleteError}
        </div>
      )}

      {post.coverImage && <img className="article-cover" src={post.coverImage} alt="" />}

      {/* The server sanitises this HTML before saving it, so it is safe to render */}
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this post?"
        message="The post will be removed permanently."
        confirmLabel="Delete post"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}
