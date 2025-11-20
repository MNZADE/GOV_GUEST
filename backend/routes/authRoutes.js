const express = require("express");
const router = express.Router();

const aadhaarData = require("../mockAadhaar");

// LOGIN USING AADHAAR ONLY
router.post("/login", async (req, res) => {
  try {
    const { aadhaar } = req.body;

    if (!aadhaar) {
      return res.status(400).json({ message: "Aadhaar number is required" });
    }

    // SEARCH USER IN MOCK DATA
    const user = aadhaarData.find((c) => c.aadhaar === aadhaar);

    if (!user) {
      return res.status(404).json({ message: "Aadhaar not found" });
    }

    // SUCCESS → SEND USER DETAILS
    res.json({
      success: true,
      citizen: user
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
