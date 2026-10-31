
const express = require("express");
const { db } = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const SESSION_CREDITS = 5;

// ==========================================
// 1. POST /api/bookings
// Create a new booking request
// ==========================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      mentor_id,
      session_title,
      session_description,
      session_date,
      start_time,
      end_time,
    } = req.body;

    const studentId = Number(req.user.id);
    const mentorId = Number(mentor_id);

    if (
      !mentor_id ||
      !session_title ||
      !session_date ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        success: false,
        message: "Required booking details are missing",
      });
    }

    if (
      !Number.isInteger(mentorId) ||
      mentorId <= 0 ||
      typeof session_title !== "string" ||
      !session_title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID or session title",
      });
    }

    if (
      typeof session_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(session_date) ||
      typeof start_time !== "string" ||
      !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(start_time) ||
      typeof end_time !== "string" ||
      !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(end_time)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid session date or time format",
      });
    }

    const parsedDate = new Date(`${session_date}T00:00:00Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== session_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid session date",
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    if (session_date < today) {
      return res.status(400).json({
        success: false,
        message: "Session date cannot be in the past",
      });
    }

    const normalizedStart =
      start_time.length === 5 ? `${start_time}:00` : start_time;

    const normalizedEnd =
      end_time.length === 5 ? `${end_time}:00` : end_time;

    if (normalizedStart >= normalizedEnd) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    if (studentId === mentorId) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own mentor profile",
      });
    }

    // Check that mentor profile exists
    const [mentors] = await db.execute(
      "SELECT user_id FROM mentor_profiles WHERE user_id = ?",
      [mentorId]
    );

    if (mentors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    // Fixed cost: 5 credits per session
    const bookingCredits = SESSION_CREDITS;

    const [result] = await db.execute(
      `INSERT INTO bookings
      (
        student_id,
        mentor_id,
        session_title,
        session_description,
        session_date,
        start_time,
        end_time,
        credits
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        mentorId,
        session_title.trim(),
        session_description || null,
        session_date,
        normalizedStart,
        normalizedEnd,
        bookingCredits,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Booking request created successfully",
      bookingId: result.insertId,
      credits: bookingCredits,
      status: "pending",
    });
  } catch (error) {
    console.error("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ==========================================
// 2. GET /api/bookings/received
// Get bookings received by mentor
// ==========================================
router.get("/received", authMiddleware, async (req, res) => {
  try {
    const mentorId = Number(req.user.id);

    const [bookings] = await db.execute(
      `SELECT
        b.id AS booking_id,
        b.student_id,
        u.name AS student_name,
        u.email AS student_email,
        b.session_title,
        b.session_description,
        b.session_date,
        b.start_time,
        b.end_time,
        b.credits,
        b.status,
        b.created_at
      FROM bookings b
      JOIN users u ON b.student_id = u.id
      WHERE b.mentor_id = ?
      ORDER BY b.created_at DESC`,
      [mentorId]
    );

    return res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Received Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ==========================================
// 3. PUT /api/bookings/:id/accept
// Mentor accepts a booking
// ==========================================
router.put("/:id/accept", authMiddleware, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const mentorId = Number(req.user.id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const [result] = await db.execute(
      `UPDATE bookings
       SET status = 'accepted'
       WHERE id = ?
       AND mentor_id = ?
       AND status = 'pending'`,
      [bookingId, mentorId]
    );

    if (result.affectedRows === 0) {
      const [bookings] = await db.execute(
        "SELECT id, status FROM bookings WHERE id = ? AND mentor_id = ?",
        [bookingId, mentorId]
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Only pending bookings can be accepted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      bookingId,
      status: "accepted",
    });
  } catch (error) {
    console.error("Accept Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ==========================================
// 4. PUT /api/bookings/:id/reject
// Mentor rejects a booking
// ==========================================
router.put("/:id/reject", authMiddleware, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const mentorId = Number(req.user.id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const [result] = await db.execute(
      `UPDATE bookings
       SET status = 'rejected'
       WHERE id = ?
       AND mentor_id = ?
       AND status = 'pending'`,
      [bookingId, mentorId]
    );

    if (result.affectedRows === 0) {
      const [bookings] = await db.execute(
        "SELECT id, status FROM bookings WHERE id = ? AND mentor_id = ?",
        [bookingId, mentorId]
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Only pending bookings can be rejected",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      bookingId,
      status: "rejected",
    });
  } catch (error) {
    console.error("Reject Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ==========================================
// 5. GET /api/bookings/my-bookings
// Get bookings created by student
// ==========================================
router.get("/my-bookings", authMiddleware, async (req, res) => {
  try {
    const studentId = Number(req.user.id);

    const [bookings] = await db.execute(
      `SELECT
        b.id AS booking_id,
        b.mentor_id,
        u.name AS mentor_name,
        u.email AS mentor_email,
        b.session_title,
        b.session_description,
        b.session_date,
        b.start_time,
        b.end_time,
        b.credits,
        b.status,
        b.created_at
      FROM bookings b
      JOIN users u ON b.mentor_id = u.id
      WHERE b.student_id = ?
      ORDER BY b.created_at DESC`,
      [studentId]
    );

    return res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("My Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ==========================================
// 6. PUT /api/bookings/:id/complete
// Complete session and transfer 5 credits
// ==========================================
router.put("/:id/complete", authMiddleware, async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const bookingId = Number(req.params.id);
    const mentorId = Number(req.user.id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    connection = await db.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // Lock booking row to prevent duplicate completion
    const [bookings] = await connection.execute(
      `SELECT id, student_id, mentor_id, status
       FROM bookings
       WHERE id = ?
       FOR UPDATE`,
      [bookingId]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // Verify assigned mentor
    if (Number(booking.mentor_id) !== mentorId) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(403).json({
        success: false,
        message: "Only the assigned mentor can complete this booking",
      });
    }

    // Prevent completing the same booking more than once
    if (booking.status === "completed") {
      await connection.rollback();
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "This session has already been completed",
      });
    }

    if (booking.status !== "accepted") {
      await connection.rollback();
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "Only accepted bookings can be completed",
      });
    }

    const studentId = Number(booking.student_id);
    const credits = SESSION_CREDITS;

    if (studentId === mentorId) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: "Invalid booking participants",
      });
    }

    // Lock both wallets
    const [wallets] = await connection.execute(
      `SELECT user_id, balance
       FROM wallets
       WHERE user_id IN (?, ?)
       ORDER BY user_id
       FOR UPDATE`,
      [studentId, mentorId]
    );

    const studentWallet = wallets.find(
      (wallet) => Number(wallet.user_id) === studentId
    );

    const mentorWallet = wallets.find(
      (wallet) => Number(wallet.user_id) === mentorId
    );

    if (!studentWallet || !mentorWallet) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message:
          "Student or mentor wallet not found. Please create the missing wallet first.",
      });
    }

    const studentBalance = Number(studentWallet.balance);

    if (studentBalance < credits) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
        availableBalance: studentBalance,
        requiredCredits: credits,
      });
    }

    // Deduct 5 credits from learner
    await connection.execute(
      `UPDATE wallets
       SET balance = balance - ?
       WHERE user_id = ?`,
      [credits, studentId]
    );

    // Add 5 credits to mentor
    await connection.execute(
      `UPDATE wallets
       SET balance = balance + ?
       WHERE user_id = ?`,
      [credits, mentorId]
    );

    // Record learner spending
    await connection.execute(
      `INSERT INTO credit_transactions
       (user_id, booking_id, transaction_type, credits, description)
       VALUES (?, ?, 'spent', ?, ?)`,
      [
        studentId,
        bookingId,
        credits,
        "Credits spent on mentorship session",
      ]
    );

    // Record mentor earning
    await connection.execute(
      `INSERT INTO credit_transactions
       (user_id, booking_id, transaction_type, credits, description)
       VALUES (?, ?, 'earned', ?, ?)`,
      [
        mentorId,
        bookingId,
        credits,
        "Credits earned from mentorship session",
      ]
    );

    // Mark booking completed
    const [updateResult] = await connection.execute(
      `UPDATE bookings
       SET status = 'completed', credits = ?
       WHERE id = ? AND status = 'accepted'`,
      [credits, bookingId]
    );

    if (updateResult.affectedRows !== 1) {
      throw new Error("Booking status could not be updated");
    }

    // Commit all changes together
    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Session completed and credits transferred successfully",
      bookingId,
      creditsTransferred: credits,
      studentId,
      mentorId,
      status: "completed",
    });
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    console.error("Complete Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// ==========================================
// 7. GET /api/bookings/:id/collaboration-access
// Verify access to a collaboration room
// ==========================================
router.get(
  "/:id/collaboration-access",
  authMiddleware,
  async (req, res) => {
    try {
      const bookingId = Number(req.params.id);
      const userId = Number(req.user.id);

      if (!Number.isSafeInteger(bookingId) || bookingId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking ID",
        });
      }

      const [rows] = await db.execute(
        `SELECT id, student_id, mentor_id, status
         FROM bookings
         WHERE id = ?`,
        [bookingId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      const booking = rows[0];

      const isParticipant =
        Number(booking.student_id) === userId ||
        Number(booking.mentor_id) === userId;

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          message: "You are not a participant in this booking",
        });
      }

      if (booking.status !== "accepted") {
        return res.status(403).json({
          success: false,
          message: "Only accepted bookings allow collaboration",
        });
      }

      return res.status(200).json({
        success: true,
        allowed: true,
        bookingId,
        roomId: `booking-${bookingId}`,
      });
    } catch (error) {
      console.error("Collaboration Access Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// ==========================================
// Export router
// ==========================================
module.exports = router;
