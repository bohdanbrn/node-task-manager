const express = require("express");
const moment = require("moment");
const User = require("../models/user");
const Task = require("../models/task");
const checkAuth = require("../middleware/auth");
const { taskPermissions } = require("../middleware/permissions");
const router = new express.Router();

// TODO
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get("/dashboard", checkAuth, async (req, res) => {
    const result = {
        user: req.user,
        tasks: [],
        successMsg: "",
        errors: []
    };

    try {
        const match = {
            completed: "in proggress"
        };
        const sort = {};

        if (req.query.completed) {
            const availableStatuses = ["in proggress", "completed"];

            if (availableStatuses.indexOf(req.query.completed)) {
                match.completed = req.query.completed;
            }
        }

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(":");
            sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
        }

        const tasks = await Task
            .find({ $or: [{ owner: { $eq: req.user._id } }, { sharedUsers: { $eq: req.user._id } }] })
            .lean()
            .populate("owner", "name email")
            .populate("sharedUsers", "name email");

        if (!tasks) {
            throw new Error("Tasks not found!");
        }

        for (let key in tasks) {
            if (tasks[key].owner._id.equals(req.user._id)) {
                tasks[key].owner.name = "You";
            }
            const createdAt = moment(tasks[key].createdAt);
            tasks[key].createdAtFormat = createdAt.format("DD MMMM YYYY - HH:mm");
        }
        result.tasks = tasks;

        res.render("dashboard/tasks", result);
    } catch (e) {
        result.errorMsg = "Something went wrong!";
        result.devError = e;

        res.render("dashboard/edit-task", result);
    }
});

router.get("/dashboard/tasks/create", checkAuth, (req, res) =>
    res.render("dashboard/add-task", {
        user: req.user
    })
);

router.post("/dashboard/tasks/create", checkAuth, async (req, res) => {
    const result = {
        user: req.user,
        task: {},
        successMsg: "",
        errors: []
    };

    try {
        // get only allowed fields
        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            owner: req.user._id
        });

        await task.save();

        result.successMsg = "Task successfully created";

        res.render("dashboard/add-task", result);
    } catch (e) {
        if (e.errors && e.name == "ValidationError") {
            for (let key in e.errors) {
                result.errors.push(e.errors[key].message);
            }
            result.task.title = req.body.title;
            result.task.description = req.body.description;

            res.render("dashboard/add-task", result);
        } else {
            result.errorMsg = "Something went wrong!";
            result.devError = e;

            res.render("dashboard/edit-task", result);
        }
    }
});

router.get("/dashboard/tasks/edit/:taskId", [checkAuth, taskPermissions], async (req, res) => {
    const result = {
        user: req.user,
        task: {},
        shareUsers: [],
        successMsg: "",
        errors: []
    };

    try {
        const task = req.task;

        result.task = Task.getRenderData(task);
        result.shareUsers = await User.find().where("_id").ne(req.user._id);

        res.render("dashboard/edit-task", result);
    } catch (e) {
        result.errorMsg = "Something went wrong!";
        result.devError = e;

        res.render("dashboard/edit-task", result);
    }
});

router.post("/dashboard/tasks/edit/:taskId", [checkAuth, taskPermissions], async (req, res) => {
    const result = {
        user: req.user,
        task: {},
        successMsg: "",
        errors: []
    };

    try {
        const task = req.task;

        // edit only allowed fields
        task.title = req.body.title;
        task.description = req.body.description;
        task.status = req.body.status;

        await task.save();

        result.task = Task.getRenderData(task);
        result.successMsg = "Task successfully edited";

        res.render("dashboard/edit-task", result);
    } catch (e) {
        if (e.errors && e.name == "ValidationError") {
            for (let key in e.errors) {
                result.errors.push(e.errors[key].message);
            }

            result.task = Task.getRenderData(req.body);

            res.render("dashboard/edit-task", result);
        } else {
            result.errorMsg = "Something went wrong!";
            result.devError = e;

            res.render("dashboard/edit-task", result);
        }
    }
});

router.post("/dashboard/tasks/share/:taskId", [checkAuth, taskPermissions], async (req, res) => {
    const result = {
        user: req.user,
        task: {},
        successMsg: "",
        errors: []
    };

    try {
        const task = req.task;
        const memberEmail = req.body.memberEmail;
        
        const member = await User.findOne({
            email: memberEmail
        });
        if (!member) throw new Error(`User with email ${memberEmail} is not found!`);

        // check if user is already member of this task
        const isMember = task.isMember(member._id);

        // add member
        if (!isMember) {
            task.sharedUsers.push(member);

            await task.save();
        }

        result.task = Task.getRenderData(task);
        result.successMsg = `Task successfully shared with ${member.email}!`;

        res.render("dashboard/edit-task", result);
    } catch (e) {
        result.errorMsg = "Something went wrong!";
        result.devError = e;

        res.render("dashboard/edit-task", result);
    }
});

module.exports = router;
