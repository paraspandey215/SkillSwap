
const express = require("express");
const { db } = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// GET /api/leaderboard?period=All%20Time
// ========================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const period = req.query.period || "All Time";

    const allowedPeriods = [
      "All Time",
      "This Month",
      "This Week",
    ];

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid user authentication",
      });
    }

    if (!allowedPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leaderboard period",
      });
    }

    // Date conditions for earned transactions
    let transactionDateCondition = "";

    // Date conditions for completed bookings
    let bookingDateCondition = "";

    if (period === "This Month") {
      transactionDateCondition =
        "AND ct.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')";

      bookingDateCondition =
        "AND b.updated_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')";
    }

    if (period === "This Week") {
      transactionDateCondition =
        "AND ct.created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)";

      bookingDateCondition =
        "AND b.updated_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)";
    }

    // Fetch all users with earned credits and completed sessions
    const [rows] = await db.execute(
      `
      SELECT
        u.id,
        u.name,
        u.role,
        COALESCE(mp.headline, '') AS headline,
        COALESCE(earned.total_credits, 0) AS credits,
        COALESCE(completed.total_sessions, 0) AS sessions

      FROM users u

      LEFT JOIN mentor_profiles mp
        ON mp.user_id = u.id

      LEFT JOIN (
        SELECT
          ct.user_id,
          SUM(ct.credits) AS total_credits
        FROM credit_transactions ct
        WHERE ct.transaction_type = 'earned'
        ${transactionDateCondition}
        GROUP BY ct.user_id
      ) earned
        ON earned.user_id = u.id

      LEFT JOIN (
        SELECT
          participant.user_id,
          COUNT(*) AS total_sessions
        FROM (
          SELECT
            b.student_id AS user_id,
            b.id AS booking_id,
            b.updated_at
          FROM bookings b
          WHERE b.status = 'completed'
          ${bookingDateCondition}

          UNION ALL

          SELECT
            b.mentor_id AS user_id,
            b.id AS booking_id,
            b.updated_at
          FROM bookings b
          WHERE b.status = 'completed'
          ${bookingDateCondition}
        ) participant
        GROUP BY participant.user_id
      ) completed
        ON completed.user_id = u.id

      ORDER BY
        credits DESC,
        sessions DESC,
        u.name ASC
      `
    );

    // Generate leaderboard ranking
    const leaderboard = rows.map((user, index) => ({
      id: Number(user.id),
      name: user.name,
      role: user.role,
      headline: user.headline,
      credits: Number(user.credits || 0),
      sessions: Number(user.sessions || 0),
      rank: index + 1,
      isCurrentUser: Number(user.id) === userId,
    }));

    // Find logged-in user's statistics
    const currentUser = leaderboard.find(
      (user) => user.isCurrentUser
    );

    const myStats = currentUser
      ? {
          rank: currentUser.rank,
          credits: currentUser.credits,
          sessions: currentUser.sessions,
        }
      : {
          rank: null,
          credits: 0,
          sessions: 0,
        };

    return res.status(200).json({
      success: true,
      period,
      totalUsers: leaderboard.length,
      leaderboard,
      myStats,
    });

  } catch (error) {
    console.error("Leaderboard API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch leaderboard",
    });
  }
});

module.exports = router;
