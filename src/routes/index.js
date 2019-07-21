const express = require("express");
const router = express.Router();

// Welcome Page
router.get("/", (req, res) => res.redirect("/login"));

module.exports = router;
