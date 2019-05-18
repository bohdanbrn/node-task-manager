const express = require("express");
const Task = require("../models/task");
const checkAuth = require("../middleware/auth");
const router = new express.Router();

router.get("/dashboard/add-task", checkAuth, (req, res) =>
    res.render("add-task")
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

        res.render("add-task", result);
    } catch (e) {
        if (e.errors && e.name == "ValidationError") {
            for (let key in e.errors) {
                result.errors.push({
                    msg: e.errors[key].message
                });
            }
            result.task.title = req.body.title;
            result.task.description = req.body.description;

            res.render("add-task", result);
        } else {
            res.status(400).send(e);
        }
    }
});

module.exports = router;
