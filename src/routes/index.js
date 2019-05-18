const express = require('express');
const router = express.Router();
const checkAuth = require("../middleware/auth");

// Welcome Page
router.get('/', (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', checkAuth, (req, res) => res.render('dashboard', {
    username: req.user.name
}));

module.exports = router;