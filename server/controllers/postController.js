const Post = require("../models/Post");
const { cleanHtml, toText, makeExcerpt } = require("../utils/html");

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Shape of a post in API responses
function serialize(post, author, withContent) {
  const a = author || post.author;
  const out = {
    id: post._id,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage || "",
    author: a ? { id: a._id, name: a.name } : null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
  if (withContent) out.content = post.content;
  return out;
}

const authorIdOf = (post) => String(post.author._id ?? post.author);

// GET /api/posts?search=&author=&page=&limit=   (public)
exports.listPosts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 30);

    const filter = {};
    if (req.query.author) filter.author = req.query.author;
    if (req.query.search) {
      const re = { $regex: escapeRegex(String(req.query.search).trim()), $options: "i" };
      filter.$or = [{ title: re }, { excerpt: re }];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .select("-content")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("author", "name"),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts: posts.map((p) => serialize(p)),
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id   (public)
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ post: serialize(post, null, true) });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts   (signed in)
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, coverImage } = req.body || {};
    const clean = cleanHtml(content);
    if (!toText(clean) && !/<img\b/i.test(clean)) {
      return res.status(400).json({ message: "Write something in the post body" });
    }
    const post = await Post.create({
      title,
      content: clean,
      excerpt: makeExcerpt(clean),
      coverImage: coverImage || "",
      author: req.user._id,
    });
    res.status(201).json({ post: serialize(post, req.user, true) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id   (only the author)
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (authorIdOf(post) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const { title, content, coverImage } = req.body || {};
    if (title !== undefined) post.title = title;
    if (coverImage !== undefined) post.coverImage = coverImage || "";
    if (content !== undefined) {
      const clean = cleanHtml(content);
      if (!toText(clean) && !/<img\b/i.test(clean)) {
        return res.status(400).json({ message: "Write something in the post body" });
      }
      post.content = clean;
      post.excerpt = makeExcerpt(clean);
    }
    await post.save();
    res.json({ post: serialize(post, req.user, true) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id   (only the author)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (authorIdOf(post) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};
