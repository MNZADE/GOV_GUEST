import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* =========================================================
   CREATE DEFAULT SYSTEM MANAGER (SAFE INIT)
========================================================= */
const ensureDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@kmc.gov.in";

    const exists = await User.findOne({ email: adminEmail });
    if (exists) return;

    const hashedPassword = await bcrypt.hash("admin123", 12);

    await User.create({
      name: "System Manager",
      email: adminEmail,
      password: hashedPassword,
      role: "system_manager",
      isActive: true,
      isOnline: false,
      loginHistory: [],
    });

    console.log("✅ Default System Manager created");
  } catch (err) {
    console.error("❌ Failed to create default admin:", err.message);
  }
};

/* 👉 Run after small delay to ensure DB connected */
setTimeout(ensureDefaultAdmin, 2000);

/* =========================================================
   LOGIN
========================================================= */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    user.isOnline = true;
    user.loginHistory.push({ loginAt: new Date() });
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        department: user.department || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   VERIFY SYSTEM MANAGER
========================================================= */
router.post("/verify-system-manager", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({
      email,
      role: "system_manager",
      isActive: true,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "System Manager not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    res.json({
      success: true,
      message: "Verified successfully",
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   CREATE MANAGER
========================================================= */
router.post("/create-manager", adminAuth, async (req, res) => {
  try {
    if (req.user.role !== "system_manager") {
      return res.status(403).json({
        success: false,
        message: "Only System Manager allowed",
      });
    }

    const {
      name,
      email,
      password,
      department,
      address,
      designation,
      personalEmail,
      mobile,
    } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: "All required fields missing",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const count = await User.countDocuments({
      role: "department_manager",
    });

    const enrollmentId = `KMC-DM-${new Date().getFullYear()}-${String(
      count + 1
    ).padStart(4, "0")}`;

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "department_manager",
      department,
      designation: designation || "Department Manager",
      address,
      personalEmail,
      mobile,
      enrollmentId,
      isActive: true,
      isOnline: false,
      loginHistory: [],
    });

    res.status(201).json({
      success: true,
      message: "Manager created successfully",
    });

  } catch (err) {
    console.error("CREATE MANAGER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================================================
   GET CURRENT USER
========================================================= */
router.get("/me", adminAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ success: true, user });
});

/* =========================================================
   LOGOUT
========================================================= */
router.post("/logout", adminAuth, async (req, res) => {
  const user = await User.findById(req.user.id);

  user.isOnline = false;

  const last = user.loginHistory.at(-1);
  if (last && !last.logoutAt) {
    last.logoutAt = new Date();
  }

  await user.save();

  res.json({ success: true });
});

export default router;