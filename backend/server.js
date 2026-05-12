import dotenv from "dotenv";
dotenv.config(); // ✅ MUST BE FIRST

import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import twilio from "twilio";
import path from "path"; // ✅ ADDED

/* ================= IMPORT ROUTES ================= */
import authRoutes from "./routes/authRoutes.js";
import managerAuthRoutes from "./routes/managerAuthRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import officerRoutes from "./routes/officerRoutes.js";
import managerRoutesFactory from "./routes/managerRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
/* ================= IMPORT MODELS ================= */
import User from "./models/User.js";
import Notification from "./models/Notification.js";

/* ================= APP ================= */
const app = express();
const server = http.createServer(app);

/* ================= TWILIO CONFIG ================= */
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.warn("⚠️ Twilio ENV not set properly");
}

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* ================= CORS CONFIG ================= */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.options("*", cors());

/* ================= BODY PARSER ================= */
app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));

/* ✅ STATIC IMAGE FOLDER */

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);
/* ================= ✅ STATIC FILES FIX ================= */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

/* ================= SOCKET EVENTS ================= */
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join", (userId) => socket.join(userId));

  socket.on("joinDepartment", (department) => {
    socket.join(department);
  });

  socket.on("managerOnline", async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      user.isOnline = true;
      user.loginHistory = user.loginHistory || [];
      user.loginHistory.push({ loginAt: new Date() });

      await user.save();
      socket.userId = userId;

    } catch (err) {
      console.error("Manager Online Error:", err.message);
    }
  });

  socket.on("complaintUpdate", async (data) => {
    try {
      io.to(data.department).emit("complaintUpdated", data);

      if (data.userId) {
        const notification = await Notification.create({
          user: data.userId,
          message: data.message,
          complaintId: data.complaintId,
        });

        io.to(data.userId).emit("newNotification", notification);

        /* ✅ WHATSAPP MESSAGE */
        if (data.phone) {
          const phone = data.phone.startsWith("+91")
            ? data.phone
            : `+91${data.phone}`;

          await twilioClient.messages.create({
            body: data.message,
            from: "whatsapp:+14155238886",
            to: `whatsapp:${phone}`,
          });
        }
      }

    } catch (err) {
      console.error("Complaint Update Error:", err.message);
    }
  });

  socket.on("disconnect", async () => {
    try {
      if (!socket.userId) return;

      const user = await User.findById(socket.userId);
      if (!user) return;

      const last = user.loginHistory?.at(-1);
      if (last && !last.logoutAt) {
        last.logoutAt = new Date();
      }

      user.isOnline = false;
      await user.save();

      console.log("🔴 User disconnected:", socket.userId);

    } catch (err) {
      console.error("Disconnect Error:", err.message);
    }
  });
});

/* ================= MONGODB ================= */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/manager-auth", managerAuthRoutes);
app.use("/api/manager", managerRoutesFactory(io));
app.use("/api/complaints", complaintRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/notices", noticeRoutes);
app.use(
  "/api/analytics",
  analyticsRoutes
);


/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("🚀 Backend Running Successfully");
});

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

/* ================= START ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});



// import dotenv from "dotenv";
// dotenv.config(); // ✅ MUST BE FIRST

// import express from "express";
// import http from "http";
// import cors from "cors";
// import mongoose from "mongoose";
// import { Server } from "socket.io";
// import twilio from "twilio";

// /* ================= IMPORT ROUTES ================= */
// import authRoutes from "./routes/authRoutes.js";
// import managerAuthRoutes from "./routes/managerAuthRoutes.js";
// import complaintRoutes from "./routes/complaintRoutes.js";
// import managerRoutesFactory from "./routes/managerRoutes.js";
// import departmentRoutes from "./routes/departmentRoutes.js";
// import noticeRoutes from "./routes/noticeRoutes.js"; // ✅ NEW

// /* ================= IMPORT MODELS ================= */
// import User from "./models/User.js";
// import Notification from "./models/Notification.js";

// /* ================= APP ================= */
// const app = express();
// const server = http.createServer(app);

// /* ================= TWILIO CONFIG ================= */
// if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
//   console.warn("⚠️ Twilio ENV not set properly");
// }

// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// /* ================= SOCKET.IO ================= */
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

// app.set("io", io);

// /* ================= SOCKET EVENTS ================= */
// io.on("connection", (socket) => {
//   console.log("🟢 Socket connected:", socket.id);

//   socket.on("join", (userId) => socket.join(userId));

//   socket.on("joinDepartment", (department) => {
//     socket.join(department);
//   });

//   socket.on("managerOnline", async (userId) => {
//     try {
//       const user = await User.findById(userId);
//       if (!user) return;

//       user.isOnline = true;
//       user.loginHistory = user.loginHistory || [];
//       user.loginHistory.push({ loginAt: new Date() });

//       await user.save();
//       socket.userId = userId;

//     } catch (err) {
//       console.error("Manager Online Error:", err.message);
//     }
//   });

//   socket.on("complaintUpdate", async (data) => {
//     try {
//       io.to(data.department).emit("complaintUpdated", data);

//       if (data.userId) {
//         const notification = await Notification.create({
//           user: data.userId,
//           message: data.message,
//           complaintId: data.complaintId,
//         });

//         io.to(data.userId).emit("newNotification", notification);

//         /* ✅ SEND WHATSAPP MESSAGE */
//         if (data.phone) {
//           const phone = data.phone.startsWith("+91")
//             ? data.phone
//             : `+91${data.phone}`;

//           await twilioClient.messages.create({
//             body: data.message,
//             from: "whatsapp:+14155238886",
//             to: `whatsapp:${phone}`,
//           });
//         }
//       }

//     } catch (err) {
//       console.error("Complaint Update Error:", err.message);
//     }
//   });

//   socket.on("disconnect", async () => {
//     try {
//       if (!socket.userId) return;

//       const user = await User.findById(socket.userId);
//       if (!user) return;

//       const last = user.loginHistory?.at(-1);
//       if (last && !last.logoutAt) {
//         last.logoutAt = new Date();
//       }

//       user.isOnline = false;
//       await user.save();

//       console.log("🔴 User disconnected:", socket.userId);

//     } catch (err) {
//       console.error("Disconnect Error:", err.message);
//     }
//   });
// });

// /* ================= MIDDLEWARE ================= */
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true,
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// /* ================= MONGODB ================= */
// if (!process.env.MONGO_URI) {
//   console.error("❌ MONGO_URI missing in .env");
//   process.exit(1);
// }

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => {
//     console.error("❌ MongoDB Error:", err.message);
//     process.exit(1);
//   });

// /* ================= ROUTES ================= */
// app.use("/api/auth", authRoutes);
// app.use("/api/manager-auth", managerAuthRoutes);
// app.use("/api/manager", managerRoutesFactory(io));
// app.use("/api/complaints", complaintRoutes);
// app.use("/api/departments", departmentRoutes);
// app.use("/api/notices", noticeRoutes); // ✅ NEW ADDED

// /* ================= ROOT ================= */
// app.get("/", (req, res) => {
//   res.send("🚀 Backend Running Successfully");
// });

// /* ================= HEALTH CHECK ================= */
// app.get("/api/health", (req, res) => {
//   res.json({ status: "OK", message: "Server is running" });
// });

// /* ================= START ================= */
// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });