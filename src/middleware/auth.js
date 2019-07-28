module.exports = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("errorMsg", "Please log in to view this resource");
    res.redirect("/login");
};
