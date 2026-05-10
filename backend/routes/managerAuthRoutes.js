import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* =========================================================
   CREATE DEFAULT SYSTEM MANAGER
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

    console.log("LOGIN ATTEMPT:", email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    /* ================= TOKEN (FIXED) ================= */
    const token = jwt.sign(
      {
        id: user._id.toString(), // 🔥 FIX
        role: user.role,
        department: user.department || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("TOKEN GENERATED:", token);

    /* ================= UPDATE USER ================= */
    user.isOnline = true;
    user.loginHistory.push({ loginAt: new Date() });
    await user.save();

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(), // 🔥 CONSISTENT
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
      },
    });

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

/* =========================================================
   CREATE DEPARTMENT MANAGER
========================================================= */
router.post("/create-manager", adminAuth, async (req, res) => {
  try {
    if (req.user.role !== "system_manager") {
      return res.status(403).json({
        success: false,
        message: "Only System Manager allowed",
      });
    }

    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
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

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "department_manager",
      department,
      isActive: true,
      isOnline: false,
      loginHistory: [],
    });

    res.status(201).json({
      success: true,
      message: "Department Manager created successfully",
    });

  } catch (err) {
    console.error("❌ CREATE MANAGER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create manager",
    });
  }
});

/* =========================================================
   GET CURRENT USER
========================================================= */
router.get("/me", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================================================
   LOGOUT
========================================================= */
router.post("/logout", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.isOnline = false;

      const last = user.loginHistory.at(-1);
      if (last && !last.logoutAt) {
        last.logoutAt = new Date();
      }

      await user.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;



















// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import adminAuth from "../middleware/adminAuth.js";

// const router = express.Router();

// /* =========================================================
//    CREATE DEFAULT SYSTEM MANAGER (SAFE INIT)
// ========================================================= */
// const ensureDefaultAdmin = async () => {
//   try {
//     const adminEmail = "admin@kmc.gov.in";

//     const exists = await User.findOne({ email: adminEmail });
//     if (exists) return;

//     const hashedPassword = await bcrypt.hash("admin123", 12);

//     await User.create({
//       name: "System Manager",
//       email: adminEmail,
//       password: hashedPassword,
//       role: "system_manager",
//       isActive: true,
//       isOnline: false,
//       loginHistory: [],
//     });

//     console.log("✅ Default System Manager created");
//   } catch (err) {
//     console.error("❌ Failed to create default admin:", err.message);
//   }
// };

// setTimeout(ensureDefaultAdmin, 2000);

// /* =========================================================
//    LOGIN (FOR BOTH ROLES)
// ========================================================= */
// router.post("/login", async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     if (!email?.trim() || !password?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password are required",
//       });
//     }

//     email = email.trim().toLowerCase();

//     const user = await User.findOne({ email });

//     // 🔍 DEBUG (REMOVE IN PROD)
//     console.log("LOGIN ATTEMPT:", email);
//     console.log("USER FOUND:", user);

//     /* ================= USER NOT FOUND ================= */
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     /* ================= ACCOUNT DISABLED ================= */
//     if (!user.isActive) {
//       return res.status(403).json({
//         success: false,
//         message: "Account is disabled. Contact admin.",
//       });
//     }

//     /* ================= PASSWORD CHECK ================= */
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid password",
//       });
//     }

//     /* ================= UPDATE USER STATUS ================= */
//     user.isOnline = true;
//     user.loginHistory.push({ loginAt: new Date() });
//     await user.save();

//     /* ================= TOKEN ================= */
//     const token = jwt.sign(
//       {
//         id: user._id,
//         role: user.role,
//         department: user.department || null,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     /* ================= RESPONSE ================= */
//     res.json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         department: user.department || null,
//       },
//     });

//   } catch (err) {
//     console.error("❌ LOGIN ERROR:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error during login",
//     });
//   }
// });

// /* =========================================================
//    CREATE DEPARTMENT MANAGER
// ========================================================= */
// router.post("/create-manager", adminAuth, async (req, res) => {
//   try {
//     if (req.user.role !== "system_manager") {
//       return res.status(403).json({
//         success: false,
//         message: "Only System Manager allowed",
//       });
//     }

//     const { name, email, password, department } = req.body;

//     if (!name || !email || !password || !department) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const normalizedEmail = email.trim().toLowerCase();

//     const exists = await User.findOne({ email: normalizedEmail });

//     if (exists) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);

//     await User.create({
//       name,
//       email: normalizedEmail,
//       password: hashedPassword,
//       role: "department_manager",
//       department,
//       isActive: true, // ✅ IMPORTANT
//       isOnline: false,
//       loginHistory: [],
//     });

//     res.status(201).json({
//       success: true,
//       message: "Department Manager created successfully",
//     });

//   } catch (err) {
//     console.error("❌ CREATE MANAGER ERROR:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create manager",
//     });
//   }
// });

// /* =========================================================
//    GET ALL MANAGERS
// ========================================================= */
// router.get("/managers", adminAuth, async (req, res) => {
//   try {
//     if (req.user.role !== "system_manager") {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     const managers = await User.find({ role: "department_manager" })
//       .select("-password")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, managers });

//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// /* =========================================================
//    TOGGLE MANAGER (ENABLE / DISABLE)
// ========================================================= */
// router.put("/toggle-manager/:id", adminAuth, async (req, res) => {
//   try {
//     if (req.user.role !== "system_manager") {
//       return res.status(403).json({ success: false });
//     }

//     const manager = await User.findById(req.params.id);

//     if (!manager) {
//       return res.status(404).json({
//         success: false,
//         message: "Manager not found",
//       });
//     }

//     if (manager._id.toString() === req.user.id) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot disable yourself",
//       });
//     }

//     manager.isActive = !manager.isActive;
//     await manager.save();

//     res.json({
//       success: true,
//       message: manager.isActive ? "Enabled" : "Disabled",
//     });

//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// /* =========================================================
//    DELETE MANAGER
// ========================================================= */
// router.delete("/delete-manager/:id", adminAuth, async (req, res) => {
//   try {
//     if (req.user.role !== "system_manager") {
//       return res.status(403).json({ success: false });
//     }

//     await User.findByIdAndDelete(req.params.id);

//     res.json({
//       success: true,
//       message: "Manager deleted",
//     });

//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// /* =========================================================
//    GET CURRENT USER
// ========================================================= */
// router.get("/me", adminAuth, async (req, res) => {
//   const user = await User.findById(req.user.id).select("-password");

//   res.json({
//     success: true,
//     user,
//   });
// });

// /* =========================================================
//    LOGOUT
// ========================================================= */
// router.post("/logout", adminAuth, async (req, res) => {
//   const user = await User.findById(req.user.id);

//   if (user) {
//     user.isOnline = false;

//     const last = user.loginHistory.at(-1);
//     if (last && !last.logoutAt) {
//       last.logoutAt = new Date();
//     }

//     await user.save();
//   }

//   res.json({ success: true });
// });

// export default router;