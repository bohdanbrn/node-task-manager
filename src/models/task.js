const mongoose = require("mongoose");
const User = require('../models/User');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        minlength: 1,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['in proggress', 'completed'],
        default: 'in proggress'
    },
    completedDate: {
        type: Date,
        default: 0000-00-00
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

/**
 * Get task oener by userId
 * @param {object} task 
 * @param {ObjectId} userId 
 */
taskSchema.statics.getTaskOwner = async function (task, userId) {
    if (task.owner.equals(userId)) {
        return "You";
    }
    else {
        let taskOwner = await User.findOne({
            _id: task.owner
        });

        if (!taskOwner) {
            throw new Error('Owner not found');
        }

        return taskOwner.name;
    }
}

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
