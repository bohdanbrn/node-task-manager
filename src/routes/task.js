const express = require("express");
const Task = require("../models/task");
const checkAuth = require("../middleware/auth");
const router = new express.Router();

router.get("/dashboard/add-task", checkAuth, (req, res) =>
    res.render("dashboard/add-task")
);

router.post("/dashboard/add-task", checkAuth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    let result = {
        errors: [],
        success_msg: "",
        task: {}
    };

    try {
        await task.save();

        result.success_msg = "Task successfully created";

        res.render("dashboard/add-task", result);
    } catch (e) {
        if (e.errors && e.name == "ValidationError") {
            for (let key in e.errors) {
                result.errors.push({
                    msg: e.errors[key].message
                });
            }
            result.task.title = req.body.title;
            result.task.description = req.body.description;

            res.render("dashboard/add-task", result);
        } else {
            res.status(400).send(e);
        }
    }
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get("/dashboard/tasks", checkAuth, async (req, res) => {
    const match = {
        completed: "in proggress"
    };
    const sort = {};
    const result = {
        tasks: []
    };

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

    try {
        const tasks = await Task.find({
            owner: req.user._id
        });

        if (!tasks) {
            throw new Error("Tasks not found");
        }

        for (let key in tasks) {
            let owner = await Task.getTaskOwner(tasks[key], req.user._id);

            result.tasks.push({
                title: tasks[key].title,
                status: tasks[key].status,
                createdAt: tasks[key].createdAt,
                owner: owner
            });
        }

        res.render("dashboard/tasks", result);
    } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = router;
