const Image = require("../models/Image");

// Work out the real type from the file's first bytes, not from what the client claims.
function sniffType(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

// POST /api/images   (signed in, multipart field "image")
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Choose an image to upload" });
    }
    const type = sniffType(req.file.buffer);
    if (!type) {
      return res.status(400).json({ message: "Only JPG, PNG, GIF or WebP images are allowed" });
    }
    const img = await Image.create({
      owner: req.user._id,
      contentType: type,
      size: req.file.size,
      data: req.file.buffer,
    });
    const url = `${req.protocol}://${req.get("host")}/api/images/${img._id}`;
    res.status(201).json({ id: img._id, url });
  } catch (err) {
    next(err);
  }
};

// GET /api/images/:id   (public, so <img> tags can load it)
exports.getImage = async (req, res, next) => {
  try {
    const img = await Image.findById(req.params.id);
    if (!img) return res.status(404).json({ message: "Image not found" });
    res.set({
      "Content-Type": img.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      // The frontend lives on another domain, so allow it to embed this image
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    res.send(img.data);
  } catch (err) {
    next(err);
  }
};
