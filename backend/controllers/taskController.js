const Task = require('../models/Task');
const mongoose = require('mongoose'); // Import mongoose for aggregation

// Helper function to get the base query for a non-admin user
// A user can see tasks they created OR are assigned to.
const getTaskSecurityQuery = (userId) => {
    return {
        $or: [
            { assignedTo: userId },
            { createdBy: userId }
        ]
    };
};

// @desc   Get all tasks
// @route  GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        const userId = req.user._id;

        // 1. Build the base filter
        let baseFilter = {};
        if (req.user.role !== 'admin') {
            baseFilter = getTaskSecurityQuery(userId);
        }
        if (status) {
            baseFilter.status = status;
        }

        // 2. Build the task and summary queries
        const tasksQuery = Task.find(baseFilter)
            .populate('assignedTo', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        // This one aggregate query is much faster than 4 separate counts
        const summaryQuery = Task.aggregate([
            { $match: baseFilter },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // 3. Run queries in parallel
        const [tasks, summary] = await Promise.all([tasksQuery, summaryQuery]);

        // 4. Process results
        // Add completedTodoCount in-memory (this is fast)
        const tasksWithCount = tasks.map(task => {
            const completedCount = (task.todoChecklist || []).filter(item => item.completed).length;
            return { ...task._doc, completedTodoCount: completedCount };
        });

        // Format the summary object
        const statusSummary = {
            all: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            completedTasks: 0
        };

        summary.forEach(item => {
            if (item._id === 'Pending') statusSummary.pendingTasks = item.count;
            if (item._id === 'In Progress') statusSummary.inProgressTasks = item.count;
            if (item._id === 'Completed') statusSummary.completedTasks = item.count;
            statusSummary.all += item.count;
        });

        res.status(200).json({
            tasks: tasksWithCount,
            statusSummary,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc  Get task by ID
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('assignedTo', 'name email profileImageUrl');
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Security check
        const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));
        const isCreator = task.createdBy.equals(req.user._id);

        if (req.user.role !== 'admin' && !isAssigned && !isCreator) {
            return res.status(403).json({ message: "Forbidden: Not authorized to view this task" });
        }

        res.status(200).json({ task });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc   Create a new task (Admin only)
// @route  POST /api/tasks
// @access Private/Admin
const createTasks = async (req, res) => {
    try {
        const { title, description, priority, assignedTo, dueDate, attachments, todoChecklist } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            assignedTo,
            dueDate,
            createdBy: req.user._id, // This requires authMiddleware to be on the route
            todoChecklist,
            attachments,
            status: 'Pending', // <-- FIX: Added default status
        });
        res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
        console.error("ERROR CREATING TASK:", error); // <-- FIX: Added console log for debugging
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc   Update task detailss
// @route  PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Security check
        const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));
        const isCreator = task.createdBy.equals(req.user._id);
        if (req.user.role !== 'admin' && !isAssigned && !isCreator) {
            return res.status(403).json({ message: "Forbidden: Not authorized to update this task" });
        }

        const {
            title, description, status, priority, dueDate, todoChecklist, attachmentUrl, assignedTo
        } = req.body;

        // This is your non-atomic update logic
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (todoChecklist !== undefined) task.todoChecklist = todoChecklist;
        if (attachmentUrl !== undefined) task.attachmentUrl = attachmentUrl;
        
        if (assignedTo !== undefined) {
            if (!Array.isArray(assignedTo)) {
                return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
            }
            task.assignedTo = assignedTo;
        }

        const updatedTask = await task.save();
        res.status(200).json({ message: "Task updated successfully", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc   Delete task by ID (Admin only)
// @route  DELETE /api/tasks/:id
// @access Private/Admin
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // 'adminOnly' middleware handles auth, so we just delete
        await task.deleteOne();

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc   Update task status
// @route  PUT /api/tasks/:id/status
// @access Private
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (status === undefined) {
             return res.status(400).json({ message: "Status is required" });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Security check
        const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));
        const isCreator = task.createdBy.equals(req.user._id);
        if (req.user.role !== 'admin' && !isAssigned && !isCreator) {
            return res.status(403).json({ message: "Forbidden: Not authorized to update this task" });
        }
        
        task.status = status;

        // Auto-complete all checklist items if task is marked 'Completed'
        if (task.status === 'Completed') {
            task.todoChecklist.forEach(item => item.completed = true);
            task.progress = 100;
        }
        
        const updatedTask = await task.save();
        res.status(200).json({ message: "Task status updated successfully", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc   Update task checklist
// @route  PUT /api/tasks/:id/todo
// @access Private
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
        if (!Array.isArray(todoChecklist)) {
            return res.status(400).json({ message: "todoChecklist must be an array" });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Security check
        const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));
        const isCreator = task.createdBy.equals(req.user._id);
        if (req.user.role !== 'admin' && !isAssigned && !isCreator) {
            return res.status(403).json({ message: "Forbidden: Not authorized to update this task" });
        }
        
        task.todoChecklist = todoChecklist; // Replace with updated checklist

        // Auto-update progress and status based on checklist
        const totalItems = todoChecklist.length;
        const completedItems = todoChecklist.filter(item => item.completed).length;
        
        // Fix for divide-by-zero
        task.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        if (task.progress === 100) {
            task.status = 'Completed';
        } else if (task.progress > 0) {
            task.status = 'In Progress';
        } else {
            task.status = 'Pending';
        }

        await task.save();
        
        // Repopulate the task before sending it back
        await task.populate('assignedTo', 'name email profileImageUrl');

        res.status(200).json({ message: "Task checklist updated successfully", task: task });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc   Get dashboard data (Admin Only view)
// @route GET /api/tasks/dashboard-data
// @access Private/Admin
const getDashboardData = async (req, res) => {
    try {
        // Use $facet to run multiple aggregations in ONE database call
        const data = await Task.aggregate([
            {
                $facet: {
                    // 1. Get all counts by status
                    statusCounts: [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    // 2. Get all counts by priority
                    priorityCounts: [
                        { $group: { _id: "$priority", count: { $sum: 1 } } }
                    ],
                    // 3. Get 10 recent tasks
                    recentTasks: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 },
                        { $project: { title: 1, status: 1, priority: 1, createdAt: 1 } }
                    ],
                    // 4. Get overdue task count
                    overdueTasks: [
                        { $match: { dueDate: { $lt: new Date() }, status: { $ne: 'Completed' } } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        // Process the results into the format you want
        const result = data[0]; // $facet returns an array with one result object

        const statistics = {
            totalTasks: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            completedTasks: 0,
            overdueTasks: result.overdueTasks[0]?.count || 0
        };

        const taskDistribution = { All: 0, Pending: 0, InProgress: 0, Completed: 0 };
        result.statusCounts.forEach(s => {
            const statusKey = s._id.replace(/\s+/g, ''); // "In Progress" -> "InProgress"
            taskDistribution[statusKey] = s.count;
            statistics.totalTasks += s.count;
            if (s._id === 'Pending') statistics.pendingTasks = s.count;
            if (s._id === 'In Progress') statistics.inProgressTasks = s.count;
            if (s._id === 'Completed') statistics.completedTasks = s.count;
        });
        taskDistribution.All = statistics.totalTasks;

        const taskPriorityLevels = { Low: 0, Medium: 0, High: 0 };
         result.priorityCounts.forEach(p => {
            taskPriorityLevels[p._id] = p.count;
         });
        
        res.status(200).json({
            statistics,
            charts: {
                taskDistribution,
                taskPriorityLevels
            },
            recentTasks: result.recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc   Get dashboard data (User view)
// @route GET /api/tasks/user-dashboard-data
// @access Private
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;

        // Use $facet with a $match at the beginning
        // This is ONE database call
        const data = await Task.aggregate([
            {
                $match: getTaskSecurityQuery(userId) // Filter for the user's tasks FIRST
            },
            {
                $facet: {
                    statusCounts: [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    priorityCounts: [
                        { $group: { _id: "$priority", count: { $sum: 1 } } }
                    ],
                    recentTasks: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 },
                        { $project: { title: 1, status: 1, priority: 1, createdAt: 1 } }
                    ],
                    overdueTasks: [
                        { $match: { dueDate: { $lt: new Date() }, status: { $ne: 'Completed' } } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        // Process the results just like the admin dashboard
        const result = data[0];

        const statistics = {
            totalTasks: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            completedTasks: 0,
            overdueTasks: result.overdueTasks[0]?.count || 0
        };

        const taskDistribution = { All: 0, Pending: 0, InProgress: 0, Completed: 0 };
        result.statusCounts.forEach(s => {
            const statusKey = s._id.replace(/\s+/g, '');
            taskDistribution[statusKey] = s.count;
            statistics.totalTasks += s.count;
            if (s._id === 'Pending') statistics.pendingTasks = s.count;
            if (s._id === 'In Progress') statistics.inProgressTasks = s.count;
            if (s._id === 'Completed') statistics.completedTasks = s.count;
        });
        taskDistribution.All = statistics.totalTasks;

        const taskPriorityLevels = { Low: 0, Medium: 0, High: 0 };
         result.priorityCounts.forEach(p => {
            taskPriorityLevels[p._id] = p.count;
         });
        
        res.status(200).json({
            statistics,
            charts: {
                taskDistribution,
                taskPriorityLevels
            },
            recentTasks: result.recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTasks,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData
};
