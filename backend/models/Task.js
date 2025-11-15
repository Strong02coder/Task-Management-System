const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
}, { _id: false }); // Using _id: false for subdocuments is often cleaner

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    // 'description' should be a simple string
    description: {
        type: String,
        required: false, // Set to true if you want it to be mandatory
    },

    // You were missing the 'priority' field, which is what the enum was for
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'low', 'medium', 'high'],
        default: 'Low',
    },
    
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending',
    },

    dueDate: {
        type: Date,
        required: true,
    },
    
    // 'assignedTo' should be an array to match your Postman request
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    attachmentUrl: {
        type: String,
        default: 'null',
    },

    todoChecklist: [todoSchema],
    progress: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;