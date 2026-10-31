
const express = require("express");
const { db } = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/profile/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT id, name, email, role, bio, location, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: users[0],
    });

  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


// PUT /api/profile/me
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, bio, location } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 1 and 100 characters",
        });
      }

      updates.push("name = ?");
      values.push(name.trim());
    }

    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Bio must be a string of at most 1000 characters",
        });
      }

      updates.push("bio = ?");
      values.push(bio.trim());
    }

    if (location !== undefined) {
      if (typeof location !== "string" || location.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Location must be a string of at most 100 characters",
        });
      }

      updates.push("location = ?");
      values.push(location.trim());
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

    values.push(req.user.id);

    await db.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const [users] = await db.execute(
      `SELECT id, name, email, role, bio, location, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: users[0],
    });

  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


module.exports = router;
