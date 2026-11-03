import { Link } from "react-router-dom";
import { formatDate } from "../format.js";

export default function PostCard({ post }) {
  return (
    <article className="card">
      <Link to={`/posts/${post.id}`} className="card-link" aria-label={post.title}>
        {post.coverImage ? (
          <img className="card-cover" src={post.coverImage} alt="" loading="lazy" />
        ) : (
          <div className="card-cover card-cover-empty" aria-hidden="true">
            <span>{post.title.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
      </Link>
      <div className="card-body">
        <p className="card-meta">
          {post.author?.name ?? "Unknown"} · {formatDate(post.createdAt)}
        </p>
        <h2 className="card-title">
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </h2>
        <p className="card-excerpt">{post.excerpt}</p>
      </div>
    </article>
  );
}
