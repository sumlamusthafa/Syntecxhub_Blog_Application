const multer = require("multer");

// Keep the file in memory (max 2 MB) and hand it to the controller
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});
