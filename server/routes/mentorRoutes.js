
const express = require("express");
const { db } = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// POST /api/mentors
// CREATE MENTOR PROFILE
// ========================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      headline,
      skills,
      languages,
      experience,
      availability,
      hourly_credits,
      description,
    } = req.body;

    const userId = req.user.id;

    // Only mentor and both roles can create profiles
    const [users] = await db.execute(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );

    if (
      users.length === 0 ||
      !["mentor", "both"].includes(users[0].role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only mentors can create mentor profiles",
      });
    }

    if (
      typeof skills !== "string" ||
      !skills.trim() ||
      typeof languages !== "string" ||
      !languages.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Skills and languages are required",
      });
    }

    if (
      (headline !== undefined && typeof headline !== "string") ||
      (availability !== undefined && typeof availability !== "string") ||
      (description !== undefined && typeof description !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input format",
      });
    }

    const mentorExperience = experience ?? 0;
    const mentorCredits = hourly_credits ?? 1;

    if (
      !Number.isInteger(mentorExperience) ||
      mentorExperience < 0 ||
      !Number.isInteger(mentorCredits) ||
      mentorCredits < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience or hourly credits",
      });
    }

    // Check existing profile
    const [existing] = await db.execute(
      "SELECT id FROM mentor_profiles WHERE user_id = ?",
      [userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Mentor profile already exists",
      });
    }

    const [result] = await db.execute(
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
        userId,
        headline?.trim() || null,
        skills.trim(),
        languages.trim(),
        mentorExperience,
        availability?.trim() || null,
        mentorCredits,
        description?.trim() || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Mentor profile created successfully",
      mentorId: result.insertId,
    });

  } catch (error) {
    console.error("Create Mentor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


// ========================================
// GET /api/mentors
// GET ALL MENTORS
// ========================================

router.get("/", async (req, res) => {
  try {
    const [mentors] = await db.execute(
      `SELECT
        mp.id AS mentor_id,
        mp.user_id,
        u.name,
        u.email,
        u.location,
        mp.headline,
        mp.skills,
        mp.languages,
        mp.experience,
        mp.availability,
        mp.hourly_credits,
        mp.description
      FROM mentor_profiles mp
      INNER JOIN users u ON mp.user_id = u.id
      WHERE u.role IN ('mentor', 'both')
      ORDER BY mp.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      totalMentors: mentors.length,
      mentors,
    });

  } catch (error) {
    console.error("Get Mentors Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


// ========================================
// GET /api/mentors/search
// SEARCH MENTORS
// ========================================

router.get("/search", async (req, res) => {
  try {
    const { skill, language, location, minExperience } = req.query;

    let query = `
      SELECT
        mp.id AS mentor_id,
        mp.user_id,
        u.name,
        u.location,
        mp.headline,
        mp.skills,
        mp.languages,
        mp.experience,
        mp.availability,
        mp.hourly_credits,
        mp.description
      FROM mentor_profiles mp
      INNER JOIN users u ON mp.user_id = u.id
      WHERE u.role IN ('mentor', 'both')
    `;

    const values = [];

    if (skill) {
      query += " AND mp.skills LIKE ?";
      values.push(`%${skill}%`);
    }

    if (language) {
      query += " AND mp.languages LIKE ?";
      values.push(`%${language}%`);
    }

    if (location) {
      query += " AND u.location LIKE ?";
      values.push(`%${location}%`);
    }

    if (minExperience !== undefined) {
      const experience = Number(minExperience);

      if (!Number.isInteger(experience) || experience < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid minimum experience",
        });
      }

      query += " AND mp.experience >= ?";
      values.push(experience);
    }

    query += " ORDER BY mp.created_at DESC";

    const [mentors] = await db.execute(query, values);

    return res.status(200).json({
      success: true,
      totalMentors: mentors.length,
      mentors,
    });

  } catch (error) {
    console.error("Search Mentors Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


// ========================================
// GET /api/mentors/:id
// GET SINGLE MENTOR
// ========================================

router.get("/:id", async (req, res) => {
  try {
    const mentorId = Number(req.params.id);

    if (!Number.isInteger(mentorId) || mentorId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    const [mentors] = await db.execute(
      `SELECT
        mp.id AS mentor_id,
        mp.user_id,
        u.name,
        u.email,
        u.location,
        mp.headline,
        mp.skills,
        mp.languages,
        mp.experience,
        mp.availability,
        mp.hourly_credits,
        mp.description,
        mp.created_at
      FROM mentor_profiles mp
      INNER JOIN users u ON mp.user_id = u.id
      WHERE mp.id = ?
      AND u.role IN ('mentor', 'both')`,
      [mentorId]
    );

    if (mentors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mentor details fetched successfully",
      mentor: mentors[0],
    });

  } catch (error) {
    console.error("Get Single Mentor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


// ========================================
// PUT /api/mentors
// UPDATE MENTOR PROFILE
// ========================================

router.put("/", authMiddleware, async (req, res) => {
  try {
    const {
      headline,
      skills,
      languages,
      experience,
      availability,
      hourly_credits,
      description,
    } = req.body;

    const userId = req.user.id;

    // Verify user role
    const [users] = await db.execute(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );

    if (
      users.length === 0 ||
      !["mentor", "both"].includes(users[0].role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only mentors can update mentor profiles",
      });
    }

    const fields = [];
    const values = [];

    if (headline !== undefined) {
      if (typeof headline !== "string" || headline.length > 200) {
        return res.status(400).json({
          success: false,
          message: "Invalid headline",
        });
      }

      fields.push("headline = ?");
      values.push(headline.trim());
    }

    if (skills !== undefined) {
      if (typeof skills !== "string" || !skills.trim()) {
        return res.status(400).json({
          success: false,
          message: "Skills cannot be empty",
        });
      }

      fields.push("skills = ?");
      values.push(skills.trim());
    }

    if (languages !== undefined) {
      if (typeof languages !== "string" || !languages.trim()) {
        return res.status(400).json({
          success: false,
          message: "Languages cannot be empty",
        });
      }

      fields.push("languages = ?");
      values.push(languages.trim());
    }

    if (experience !== undefined) {
      if (!Number.isInteger(experience) || experience < 0) {
        return res.status(400).json({
          success: false,
          message: "Experience must be a non-negative integer",
        });
      }

      fields.push("experience = ?");
      values.push(experience);
    }

    if (availability !== undefined) {
      if (typeof availability !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid availability",
        });
      }

      fields.push("availability = ?");
      values.push(availability.trim());
    }

    if (hourly_credits !== undefined) {
      if (!Number.isInteger(hourly_credits) || hourly_credits < 1) {
        return res.status(400).json({
          success: false,
          message: "Hourly credits must be at least 1",
        });
      }

      fields.push("hourly_credits = ?");
      values.push(hourly_credits);
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid description",
        });
      }

      fields.push("description = ?");
      values.push(description.trim());
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

    const [existing] = await db.execute(
      "SELECT id FROM mentor_profiles WHERE user_id = ?",
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    values.push(userId);

    await db.execute(
      `UPDATE mentor_profiles
       SET ${fields.join(", ")}
       WHERE user_id = ?`,
      values
    );

    const [updated] = await db.execute(
      "SELECT * FROM mentor_profiles WHERE user_id = ?",
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Mentor profile updated successfully",
      mentor: updated[0],
    });

  } catch (error) {
    console.error("Update Mentor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
