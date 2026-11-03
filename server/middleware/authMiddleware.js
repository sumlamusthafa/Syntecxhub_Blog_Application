const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protects a route: requires "Authorization: Bearer <token>"
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Not authorized, token invalid or expired" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user no longer exists" });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { protect };
