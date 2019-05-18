const mongoose = require("mongoose");

const TastSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        require: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
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

const Task = mongoose.model("Task", TastSchema);

module.exports = Task;
