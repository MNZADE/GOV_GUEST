import jwt from "jsonwebtoken";
import User from "../models/User.js";

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    /* ================= DEBUG ================= */
    console.log("AUTH HEADER:", authHeader);

    /* ================= NO TOKEN ================= */
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login first.",
      });
    }

    /* ================= INVALID FORMAT ================= */
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format. Use Bearer token.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    /* ================= VERIFY TOKEN ================= */
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT VERIFY ERROR:", err.message);

      // 🔥 HANDLE EXPIRED TOKEN
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
          expired: true, // 🔥 frontend can detect this
        });
      }

      // 🔥 HANDLE INVALID TOKEN
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    console.log("DECODED TOKEN:", decoded);

    /* ================= FIX USER ID ================= */
    const userId =
      decoded.id || decoded._id || decoded.userId || decoded.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload (no user ID)",
      });
    }

    /* ================= FIND USER ================= */
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    /* ================= CHECK ACTIVE ================= */
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Access disabled by System Manager",
      });
    }

    /* ================= ATTACH USER ================= */
    req.user = {
      id: user._id,
      role: user.role,
      department: user.department || null,
      name: user.name,
      email: user.email,
    };

    console.log("AUTH SUCCESS:", req.user);

    next();
  } catch (err) {
    console.error("🔥 ADMIN AUTH ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

export default adminAuth;