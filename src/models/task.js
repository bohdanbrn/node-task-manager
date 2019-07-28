const mongoose = require("mongoose");
const moment = require("moment");

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
            default: null
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sharedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            // required: true
        }]
    }, {
        timestamps: true
    }
);

/**
 * Check if task is already shared with user
 * @param {ObjectId} userId
 */
taskSchema.methods.isMember = function (memberId) {
    const task = this;

    if (task.sharedUsers) {
        return task.sharedUsers.some(userId => userId.equals(memberId));
    }

    return false;
};

/**
 * Get task information needed for /tasks/add page
 * @param {object} task
 */
taskSchema.statics.getRenderData = function (task) {
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
}

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
