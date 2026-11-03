const mongoose = require("mongoose");

// Images are stored in MongoDB so the app also works on serverless hosts
// (Vercel can't keep uploaded files on disk).
const imageSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
