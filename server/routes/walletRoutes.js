
const express = require("express");
const { db } = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/wallet
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [wallets] = await db.execute(
      `SELECT id, user_id, balance, created_at, updated_at
       FROM wallets
       WHERE user_id = ?`,
      [userId]
    );

    if (wallets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wallet fetched successfully",
      wallet: wallets[0],
    });

  } catch (error) {
    console.error("Get Wallet Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


// GET /api/wallet/transactions
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [transactions] = await db.execute(
      `SELECT
        id,
        booking_id,
        transaction_type,
        credits,
        description,
        created_at
       FROM credit_transactions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      totalTransactions: transactions.length,
      transactions,
    });

  } catch (error) {
    console.error("Transaction History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


module.exports = router;
