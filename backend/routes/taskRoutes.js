const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const {
    getTasks,
    getTaskById,
    createTasks,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData
} = require('../controllers/taskController');

const router = express.Router();

// Task management routes
router.get("/dashboard-data", protect, getDashboardData); // Get dashboard data for logged-in user
router.get("/user-dashboard-data", protect, getUserDashboardData); // Get dashboard data for logged-in user
router.get("/", protect, getTasks);          // Get all tasks
router.get("/:id", protect, getTaskById);   // Get task by ID
router.post("/", protect, adminOnly, createTasks); // Create a new task (admin only)
router.put("/:id", protect, updateTask);    // Update task by ID
router.delete("/:id", protect, adminOnly, deleteTask); // Delete task by ID (admin only)
router.put("/:id/status", protect, updateTaskStatus); // Update task status
router.put("/:id/todo", protect, updateTaskChecklist); // Update task checklist

module.exports = router;
