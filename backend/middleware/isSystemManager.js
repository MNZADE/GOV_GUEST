const systemManagerAuth = (req, res, next) => {
  try {
    // ❌ No user (auth middleware not applied)
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized - No user found",
      });
    }

    // ❌ Not system manager
    if (req.user.role !== "system_manager") {
      return res.status(403).json({
        message: "Only System Manager can perform this action",
      });
    }

    next();

  } catch (err) {
    console.error("SYSTEM MANAGER AUTH ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export default systemManagerAuth;