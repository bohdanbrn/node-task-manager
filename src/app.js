const path = require("path");
const express = require("express");
const mustacheExpress = require("mustache-express");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

const app = express();

// Passport config
require("./config/passport.js")(passport);

// DB config
const MongoURI = process.env.MongoURI;

// Connect to Mongo
mongoose
    .connect(MongoURI, {
        useNewUrlParser: true,
        useCreateIndex: true
    })
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log(err));

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// Register '.mustache' extension with The Mustache Express
app.engine("mustache", mustacheExpress());

// Mustache
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "/views"));

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.successMsg = req.flash("successMsg");
    res.locals.errorMsg = req.flash("errorMsg");
    next();
});

// Routes
app.use("/", require("./routes/index.js"));
app.use("/", require("./routes/user.js"));
app.use("/", require("./routes/task.js"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error("Page not Found");
    err.statusCode = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.statusCode || 500);
    res.render("error", {
        statusCode: res.statusCode,
        error: err.message,
        errorDev: (app.get("env") === "development") ? err : {}
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is run on port ${PORT}!`);
});
