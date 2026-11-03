import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/auth-context.js";
import RichEditor from "../components/RichEditor.jsx";

// Used for both /write (new post) and /posts/:id/edit
export default function Editor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const coverRef = useRef(null);

  const [loaded, setLoaded] = useState(!isEdit);
  const [loadError, setLoadError] = useState("");
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [html, setHtml] = useState("");
  const [initialHtml, setInitialHtml] = useState("");
  const [coverBusy, setCoverBusy] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    api
      .getPost(id)
      .then(({ post }) => {
        if (!active) return;
        if (String(post.author?.id) !== String(user.id)) {
          setLoadError("You can only edit your own posts.");
          return;
        }
        setTitle(post.title);
        setCoverImage(post.coverImage || "");
        setHtml(post.content);
        setInitialHtml(post.content);
        setLoaded(true);
      })
      .catch((err) => active && setLoadError(err.message));
    return () => {
      active = false;
    };
  }, [id, isEdit, user.id]);

  async function handleCover(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setCoverBusy(true);
    try {
      const { url } = await api.uploadImage(file);
      setCoverImage(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setCoverBusy(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError("Give your post a title (at least 3 characters).");
      return;
    }
    if (!html) {
      setError("Write something in the post body.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = { title: title.trim(), content: html, coverImage };
      const { post } = isEdit ? await api.updatePost(id, body) : await api.createPost(body);
      navigate(`/posts/${post.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="empty">
        <strong>{loadError}</strong>
        <Link to="/">Back to all posts</Link>
      </div>
    );
  }
  if (!loaded) {
    return (
      <p className="muted" role="status">
        Loading post…
      </p>
    );
  }

  return (
    <form className="write" onSubmit={handleSave} noValidate>
      <div className="write-head">
        <h1>{isEdit ? "Edit post" : "New post"}</h1>
        <div className="write-actions">
          <Link to={isEdit ? `/posts/${id}` : "/"} className="btn btn-quiet">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      )}

      <div className="field">
        <label htmlFor="title" className="sr-only">
          Title
        </label>
        <input
          id="title"
          className="title-input"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          maxLength={150}
          placeholder="Post title"
        />
      </div>

      <div className="cover-field">
        {coverImage ? (
          <>
            <img src={coverImage} alt="Cover preview" className="cover-preview" />
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setCoverImage("")}>
              Remove cover
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-quiet cover-add"
            onClick={() => coverRef.current?.click()}
            disabled={coverBusy}
          >
            {coverBusy ? "Uploading…" : "+ Add a cover image"}
          </button>
        )}
        <input
          ref={coverRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="sr-only"
          onChange={handleCover}
          tabIndex={-1}
          aria-label="Cover image"
        />
      </div>

      <RichEditor
        initialHtml={initialHtml}
        onChange={(value) => {
          setHtml(value);
          setError("");
        }}
      />
    </form>
  );
}
