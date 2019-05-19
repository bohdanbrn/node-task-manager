const mongoose = require("mongoose");
const moment = require("moment");
const User = require("../models/User");

const taskSchema = new mongoose.Schema(
    {
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
            enum: ["in proggress", "completed"],
            default: "in proggress"
        },
        completedDate: {
            type: Date,
            default: 0000 - 00 - 00
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    {
        timestamps: true
    }
);

/**
 * Get task oener by userId
 * @param {object} task
 * @param {ObjectId} userId
 */
taskSchema.statics.getTaskOwner = async function(task, userId) {
    if (task.owner.equals(userId)) {
        return "You";
    } else {
        let taskOwner = await User.findOne({
            _id: task.owner
        });

        if (!taskOwner) {
            throw new Error("Owner not found");
        }

        return taskOwner.name;
    }
};

/**
 * Get task information needed for /edit-task page
 * @param {object} task
 */
taskSchema.statics.getRenderData = function(task) {
    const createdDate = moment(task.createdAt);
    const updatedDate = moment(task.updatedAt);

    return {
        _id: task._id,
        title: task.title,
        description: task.description,
        statusOptions: getStatusOptions(task.status),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        createdAtFormat: createdDate.format("DD MMMM YYYY - HH:mm"),
        updatedAtFormat: updatedDate.format("DD MMMM YYYY - HH:mm")
    };
};

/**
 * Get status options for Task in json format
 * @param {string} selected
 */
function getStatusOptions(selected) {
    let options = [
        { value: "in proggress", text: "In proggress" },
        { value: "completed", text: "Completed" }
    ];

    var selectedIndex = options.findIndex(opt => opt.value == selected);
    options[selectedIndex].selected = true;

    return options;
};

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
