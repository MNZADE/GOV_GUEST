const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "http://localhost:3000" },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      socket.user = jwt.verify(token, "KMC_SECRET_KEY");
      next();
    } catch {
      next(new Error("Unauthorized socket"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🔐 Socket connected:", socket.user.email);
  });
};
