
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const { db, connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const walletRoutes = require("./routes/walletRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

const app = express();
const server = http.createServer(app);

// ==========================================
// 1. CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://skill-swap-tau-ashen.vercel.app",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
    : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header (health checks, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked CORS origin:", origin);
    return callback(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ==========================================
// 2. SOCKET.IO INITIALIZATION
// ==========================================

const io = new Server(server, {
  cors: corsOptions,
});

// ==========================================
// 3. SOCKET.IO JWT AUTHENTICATION
// ==========================================

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    if (!process.env.JWT_SECRET) {
      return next(
        new Error("Server authentication is not configured")
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!Number.isSafeInteger(Number(decoded.id))) {
      return next(new Error("Invalid user information"));
    }

    socket.user = {
      id: Number(decoded.id),
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

// ==========================================
// 4. SOCKET.IO CONNECTION
// ==========================================

io.on("connection", (socket) => {
  console.log(
    `Authenticated user ${socket.user.id} connected:`,
    socket.id
  );

  const authorizedRooms = new Set();

  // ==========================================
  // JOIN ROOM WITH BOOKING AUTHORIZATION
  // ==========================================

  socket.on("join-room", async ({ bookingId, initialCode } = {}) => {
    try {
      const cleanBookingId = Number(bookingId);

      if (
        !Number.isSafeInteger(cleanBookingId) ||
        cleanBookingId <= 0 ||
        typeof initialCode !== "string"
      ) {
        socket.emit("room-error", {
          message: "Invalid booking details.",
        });
        return;
      }

      const [bookings] = await db.execute(
        `SELECT id, student_id, mentor_id, status
         FROM bookings
         WHERE id = ?`,
        [cleanBookingId]
      );

      if (bookings.length === 0) {
        socket.emit("room-error", {
          message: "Booking not found.",
        });
        return;
      }

      const booking = bookings[0];
      const userId = socket.user.id;

      const isParticipant =
        Number(booking.student_id) === userId ||
        Number(booking.mentor_id) === userId;

      if (!isParticipant) {
        socket.emit("room-error", {
          message: "You are not authorized for this booking.",
        });
        return;
      }

      if (booking.status !== "accepted") {
        socket.emit("room-error", {
          message: "Only accepted bookings allow collaboration.",
        });
        return;
      }

      const roomId = `booking-${cleanBookingId}`;

      await db.execute(
        `INSERT IGNORE INTO collaboration_rooms
         (room_id, code)
         VALUES (?, ?)`,
        [roomId, initialCode]
      );

      const [rooms] = await db.execute(
        `SELECT code
         FROM collaboration_rooms
         WHERE room_id = ?`,
        [roomId]
      );

      if (rooms.length === 0) {
        socket.emit("room-error", {
          message: "Unable to load collaboration room.",
        });
        return;
      }

      for (const previousRoom of authorizedRooms) {
        socket.leave(previousRoom);

        socket.to(previousRoom).emit("user-left", {
          message: "A participant left the room",
        });
      }

      authorizedRooms.clear();

      await socket.join(roomId);
      authorizedRooms.add(roomId);

      console.log(
        `User ${userId} joined authorized room: ${roomId}`
      );

      socket.emit("room-state", {
        code: rooms[0].code,
        bookingId: cleanBookingId,
        roomId,
      });

      socket.to(roomId).emit("user-joined", {
        message: "A new participant joined the room",
      });
    } catch (error) {
      console.error("Join room error:", error.message);

      socket.emit("room-error", {
        message: "Failed to join room. Please try again.",
      });
    }
  });

  // ==========================================
  // CODE CHANGE WITH AUTHORIZATION
  // ==========================================

  socket.on("code-change", async ({ bookingId, code } = {}) => {
    try {
      const cleanBookingId = Number(bookingId);

      if (
        !Number.isSafeInteger(cleanBookingId) ||
        cleanBookingId <= 0 ||
        typeof code !== "string"
      ) {
        return;
      }

      const roomId = `booking-${cleanBookingId}`;

      if (
        !authorizedRooms.has(roomId) ||
        !socket.rooms.has(roomId)
      ) {
        return;
      }

      const [bookings] = await db.execute(
        `SELECT student_id, mentor_id, status
         FROM bookings
         WHERE id = ?`,
        [cleanBookingId]
      );

      if (bookings.length === 0) {
        socket.emit("room-error", {
          message: "Booking no longer exists.",
        });
        return;
      }

      const booking = bookings[0];

      const isParticipant =
        Number(booking.student_id) === socket.user.id ||
        Number(booking.mentor_id) === socket.user.id;

      if (!isParticipant || booking.status !== "accepted") {
        socket.leave(roomId);
        authorizedRooms.delete(roomId);

        socket.emit("room-error", {
          message: "Your collaboration access has expired.",
        });
        return;
      }

      const [result] = await db.execute(
        `UPDATE collaboration_rooms
         SET code = ?
         WHERE room_id = ?`,
        [code, roomId]
      );

      if (result.affectedRows === 0) {
        socket.emit("room-error", {
          message: "Collaboration room not found.",
        });
        return;
      }

      socket.to(roomId).emit("code-update", {
        code,
      });
    } catch (error) {
      console.error("Code save error:", error.message);

      socket.emit("room-error", {
        message: "Failed to save code. Please try again.",
      });
    }
  });

  // ==========================================
  // LEAVE COLLABORATION ROOM
  // ==========================================

  socket.on("leave-room", ({ bookingId } = {}) => {
    const cleanBookingId = Number(bookingId);

    if (
      !Number.isSafeInteger(cleanBookingId) ||
      cleanBookingId <= 0
    ) {
      return;
    }

    const roomId = `booking-${cleanBookingId}`;

    if (
      !authorizedRooms.has(roomId) ||
      !socket.rooms.has(roomId)
    ) {
      return;
    }

    socket.leave(roomId);
    authorizedRooms.delete(roomId);

    socket.to(roomId).emit("user-left", {
      message: "A participant left the room",
    });

    console.log(
      `User ${socket.user.id} left room: ${roomId}`
    );
  });

  // ==========================================
  // DISCONNECT
  // ==========================================

  socket.on("disconnect", () => {
    console.log(
      `User ${socket.user.id} disconnected:`,
      socket.id
    );
  });
});

// ==========================================
// 5. API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// ==========================================
// 6. TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SkillSwap API!",
    status: "Backend is running successfully",
    socketIO: "Enabled",
    socketAuthentication: "JWT Enabled",
    bookingAuthorization: "Enabled",
    acceptedBookingOnly: "Enabled",
    initialCodeSync: "Enabled",
    codePersistence: "Enabled",
    leaderboardAPI: "Enabled",
  });
});

// ==========================================
// 7. START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }

    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`SkillSwap server running on port ${PORT}`);
      console.log("TiDB Cloud database connected.");
      console.log("Socket.io is ready!");
      console.log("Socket.io JWT Authentication is enabled!");
      console.log("Booking-based Room Authorization is enabled!");
      console.log("Accepted Booking Verification is enabled!");
      console.log("Initial Code Synchronization is enabled!");
      console.log("MySQL Code Persistence is enabled!");
      console.log("Leaderboard API is enabled!");
      console.log("Allowed frontend origins:", allowedOrigins);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
