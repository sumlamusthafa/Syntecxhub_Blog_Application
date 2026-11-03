const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

// Anyone can read
router.get("/", listPosts);
router.get("/:id", getPost);

// Only signed-in users can write; only the author can edit or delete
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
