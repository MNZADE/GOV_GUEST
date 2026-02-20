import express from "express";
import { citizens } from "../aadhaarData.js";

const router = express.Router();

/* --------------------------------------------------
   LOGIN (FIREBASE AUTH REQUIRED)
-------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { aadhaar } = req.body;

    // 🔐 Firebase user already verified by middleware
    const firebaseUser = req.user;

    if (!aadhaar) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number is required",
      });
    }

    // 🔍 Find citizen
    const citizen = citizens.find((c) => c.aadhaar === aadhaar);

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Aadhaar not found",
      });
    }

    // ✅ Login success
    res.json({
      success: true,
      citizen: {
        name: citizen.name,
        aadhaar: citizen.aadhaar,
        phone: citizen.phone,
        address: citizen.address,
      },
      firebaseUid: firebaseUser.uid,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
