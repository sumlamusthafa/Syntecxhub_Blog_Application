const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title must be at most 150 characters"],
    },
    // Sanitised HTML produced by the rich text editor
    content: {
      type: String,
      required: [true, "Write something in the post body"],
      maxlength: [60000, "Post is too long"],
    },
    // Plain-text preview, generated on the server
    excerpt: { type: String, default: "", maxlength: 300 },
    coverImage: {
      type: String,
      default: "",
      maxlength: [500, "Cover image link is too long"],
      validate: {
        validator: (v) => !v || /^https?:\/\//i.test(v),
        message: "Cover image must be a web link",
      },
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
