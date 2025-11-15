const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const { getUsers, getUserById, } = require('../controllers/userController');

const router = express.Router();

// User management routes
router.get("/", protect, adminOnly, getUsers);          // Get all users (admin only)
router.get("/:id", protect, getUserById);   // Get user by ID (admin only)
// router.delete("/:id", protect, adminOnly, deleteUser); // Delete user (admin only)

module.exports = router;