import jwt from "jsonwebtoken";
import User from "../models/User.js";

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided. Please login first.",
      });
    }

    // ❌ Wrong format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid token format. Use Bearer token.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 🔐 Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👤 Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // 🔴 Block inactive users
    if (!user.isActive) {
      return res.status(403).json({
        message: "Access disabled by System Manager",
      });
    }

    // ✅ Attach clean user object
    req.user = {
      id: user._id,
      role: user.role,
      department: user.department,
      name: user.name,
      email: user.email,
    };

    next();

  } catch (err) {
    console.error("ADMIN AUTH ERROR:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }

    return res.status(401).json({
      message: "Invalid token. Please login again.",
    });
  }
};

export default adminAuth;