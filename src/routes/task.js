const express = require("express");
const moment = require("moment");
const Task = require("../models/task");
const checkAuth = require("../middleware/auth");
const router = new express.Router();

// TODO
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get("/dashboard/tasks", checkAuth, async (req, res) => {
    try {
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

        const tasks = await Task.find({
            owner: req.user._id
        });

        if (!tasks) {
            throw new Error("Tasks not found");
        }

        for (let key in tasks) {
            const owner = await Task.getTaskOwner(tasks[key], req.user._id);
            const createdDate = moment(tasks[key].createdAt);

            result.tasks.push({
                _id: tasks[key]._id,
                title: tasks[key].title,
                status: tasks[key].status,
                createdAtFormat: createdDate.format("DD MMMM YYYY - HH:mm"),
                owner: owner
            });
        }

        res.render("dashboard/tasks", result);
    } catch (e) {
        res.status(404).send();
    }
});

router.get("/dashboard/add-task", checkAuth, (req, res) =>
    res.render("dashboard/add-task")
);

router.post("/dashboard/add-task", checkAuth, async (req, res) => {
    const result = {
        errors: [],
        successMsg: "",
        task: {}
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
                result.errors.push({
                    msg: e.errors[key].message
                });
            }
            result.task.title = req.body.title;
            result.task.description = req.body.description;

            res.render("dashboard/add-task", result);
        } else {
            res.status(404).send();
        }
    }
});

router.get("/dashboard/edit-task/:taskId", checkAuth, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const task = await Task.findById(taskId);

        const createdDate = moment(task.createdAt);
        const updatedDate = moment(task.updatedAt);

        res.render("dashboard/edit-task", {
            task: Task.getRenderData(task)
        });
    } catch (e) {
        res.status(404).send();
    }
});

router.post("/dashboard/edit-task/:taskId", checkAuth, async (req, res) => {
    const result = {
        errors: [],
        successMsg: "",
        task: {}
    };

    const taskId = req.params.taskId;

    try {
        const task = await Task.findById(taskId);

        // get only allowed fields
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
                result.errors.push({
                    msg: e.errors[key].message
                });
            }

            result.task = Task.getRenderData(req.body);

            res.render("dashboard/edit-task", result);
        } else {
            res.status(404).send();
        }
    }
});

module.exports = router;
