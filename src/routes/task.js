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

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});


module.exports = router;
