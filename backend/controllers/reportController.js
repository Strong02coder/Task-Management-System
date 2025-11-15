const Task = require('../models/Task');
const User = require('../models/User');
const excelJS = require('exceljs');

// @desc   Export all tasks as an Excel file
// @route  GET /api/reports/export/tasks
// @access Private/Admin
const exportTasksReport = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'name email');

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tasks Report');

        worksheet.columns = [
            { header: 'Task ID', key: 'id', width: 30 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Priority', key: 'priority', width: 15 },
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Assigned To', key: 'assignedTo', width: 30 },
            { header: 'Due Date', key: 'dueDate', width: 20 },
        ];

        tasks.forEach((task) => {
            const assignedTo = task.assignedTo
            .map((user) => `${user.name} (${user.email})`)
            .join(', ');
            worksheet.addRow({
                _id: task._id.toString(),
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                assignedTo: assignedTo || 'Unassigned',
                dueDate: task.dueDate.toISOString().split('T')[0],
            });
        });

        // Send the Excel file as a response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=tasks_report.xlsx');

        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.error("Error exporting tasks report:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc   Export all users as an Excel file
// @route  GET /api/reports/export/users
// @access Private/Admin
const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find().select('name email _id').lean();
        const userTasks = await Task.find().populate('assignedTo', 'name email _id').lean();

        // Map user IDs to their tasks
        const userTasksMap = {};
        userTasks.forEach((task) => {
            userTasksMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0, 
            };
        });

        userTasks.forEach((task) => {
            if (task.assignedTo) {
                task.assignedTo.forEach((assignedUser) => {
                    if (userTasksMap[assignedUser._id]) {
                        userTasksMap[assignedUser._id].taskCount += 1;
                        if (task.status === 'Pending') {
                            userTasksMap[assignedUser._id].pendingTasks += 1;
                        } else if (task.status === 'In Progress') {
                            userTasksMap[assignedUser._id].inProgressTasks += 1;
                        } else if (task.status === 'Completed') {
                            userTasksMap[assignedUser._id].completedTasks += 1;
                        }
                    }
                });
            }
        });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users Task Report');

        worksheet.columns = [
            { header: 'User ID', key: 'id', width: 50 },
            { header: 'User Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 40 },
            { header: 'Total Assigned Tasks', key: 'taskCount', width: 20 },
            { header: 'Pending Tasks', key: 'pendingTasks', width: 20 },
            { header: 'In Progress Tasks', key: 'inProgressTasks', width: 20 },
            { header: 'Completed Tasks', key: 'completedTasks', width: 20 },
        ];

        Object.values(userTasksMap).forEach((user) => {
            worksheet.addRow(user);
        });

        // Send the Excel file as a response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users_report.xlsx');

        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.error("Error exporting tasks report:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    exportTasksReport,
    exportUsersReport,
};

