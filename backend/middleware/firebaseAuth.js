// import admin from "firebase-admin";

// const firebaseAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     // ❌ No header
//     if (!authHeader) {
//       return res.status(401).json({
//         message: "No Firebase token provided",
//       });
//     }

//     // ❌ Wrong format
//     if (!authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         message: "Invalid token format",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     // 🔐 Verify Firebase token
//     const decoded = await admin.auth().verifyIdToken(token);

//     // ✅ Attach Firebase user
//     req.user = decoded;

//     next();

//   } catch (err) {
//     console.error("FIREBASE AUTH ERROR:", err.message);

//     return res.status(401).json({
//       message: "Invalid or expired Firebase token",
//     });
//   }
// };

// export default firebaseAuth;