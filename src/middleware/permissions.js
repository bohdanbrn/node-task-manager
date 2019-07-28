const Task = require("../models/task");

/**
 * Check permissions for edit task
 */
const taskPermissions = async function(req, res, next) {
    const taskId = req.params.taskId;

    const task = await Task.findById(taskId);
    if (!task) {
        req.flash("errorMsg", "Task is not found!");
        res.redirect("/dashboard");
    }

    // check user permissions
    const isOwner = task.owner.equals(req.user._id);
    const isMember = task.isMember(req.user._id);

    if (isOwner || isMember) {
        req.task = task;
        return next();
    }
    
    req.flash("errorMsg", "You don't have access to this task!");
    res.redirect("/dashboard");
};


module.exports = { taskPermissions };