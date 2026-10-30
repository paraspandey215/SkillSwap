
const express = require("express");
const bcrypt = require("bcryptjs");
const { db } = require("../config/db");

const router = express.Router();

// ========================================
// USER REGISTRATION API
// POST /api/auth/register
// ========================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // 2. Validate input types
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

    // 3. Clean input values
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

    // 4. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // 5. Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must not exceed 72 characters",
      });
    }

    // 6. Validate user role
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

    // 7. Check if email already exists
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

    // 8. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 9. Save user in MySQL database
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [cleanName, normalizedEmail, hashedPassword, userRole]
    );

    // 10. Send success response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: result.insertId,
        name: cleanName,
        email: normalizedEmail,
        role: userRole,
      },
    });

  } catch (error) {
    console.error("Registration Error:", error);

    // Handle duplicate email database error
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
  }
});

module.exports = router;
