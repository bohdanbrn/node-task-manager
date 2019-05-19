const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/auth");

// Welcome Page
router.get("/", (req, res) => res.render("index"));

// Dashboard
router.get("/dashboard", checkAuth, (req, res) =>
    res.render("dashboard/index", {
        username: req.user.name
    })
);

module.exports = router;
