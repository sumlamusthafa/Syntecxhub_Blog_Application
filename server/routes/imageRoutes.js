const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { uploadLimiter } = require("../middleware/rateLimiter");
const { uploadImage, getImage } = require("../controllers/imageController");

router.get("/:id", getImage);
router.post("/", protect, uploadLimiter, upload.single("image"), uploadImage);

module.exports = router;
