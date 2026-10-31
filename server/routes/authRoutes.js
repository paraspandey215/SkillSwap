
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/db");

const router = express.Router();

const STARTING_LEARNER_CREDITS = 500;

// ========================================
// USER REGISTRATION API
// POST /api/auth/register
// ========================================

router.post("/register", async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input format",
      });
    }

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 1 and 100 characters",
      });
    }

    if (normalizedEmail.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Email is too long",
      });
    }

    // Correct email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 72 characters",
      });
    }

    // Validate role
    const allowedRoles = ["student", "mentor", "both"];
    const userRole = role || "student";

    if (
      typeof userRole !== "string" ||
      !allowedRoles.includes(userRole)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    // Check existing email
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start database transaction
    connection = await db.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // Create user
    const [result] = await connection.execute(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [cleanName, normalizedEmail, hashedPassword, userRole]
    );

    const newUserId = result.insertId;

    // ========================================
    // CREATE WALLET
    // Student = 500 credits
    // Both = 500 credits
    // Mentor only = 0 credits
    // ========================================

    const startingCredits =
      userRole === "student" || userRole === "both"
        ? STARTING_LEARNER_CREDITS
        : 0;

    await connection.execute(
      `INSERT INTO wallets (user_id, balance)
       VALUES (?, ?)`,
      [newUserId, startingCredits]
    );

    // ========================================
    // CREATE MENTOR PROFILE
    // For mentor and both roles
    // ========================================

    if (userRole === "mentor" || userRole === "both") {
      await connection.execute(
        `INSERT INTO mentor_profiles
        (
          user_id,
          headline,
          skills,
          languages,
          experience,
          availability,
          hourly_credits,
          description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUserId,
          "New Mentor",
          "",
          "English, Hindi",
          0,
          "Not specified",
          5,
          "Mentor profile. Update your details from your profile settings.",
        ]
      );
    }

    // Commit transaction
    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      startingCredits,
      user: {
        id: newUserId,
        name: cleanName,
        email: normalizedEmail,
        role: userRole,
      },
    });

  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    console.error("Registration Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

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

// ========================================
// USER LOGIN API
// POST /api/auth/login
// ========================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Correct email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Find user
    const [users] = await db.execute(
      `SELECT id, name, email, password, role
       FROM users
       WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;
