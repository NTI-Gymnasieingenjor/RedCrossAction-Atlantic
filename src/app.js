const bodyParser = require('body-parser');
const express = require("express");
const session = require('express-session');
const sqlite3 = require("sqlite3");

const app = express();
const port = 8080;

const db = new sqlite3.Database("./test.db", sqlite3.OPEN_READONLY, err => {
    if (err)
        console.error(err);
});

app.set("view engine", "pug");
app.use(express.static('public'))

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "secret"
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    let isLoggedIn = req.session.role == "jour";
    res.render("pages/home", {data: {isLoggedIn: isLoggedIn}}); 
});

app.get("/login", (req, res) => {
    let isLoggedIn = req.session.role == "jour";
    res.render("pages/login", {data: {isLoggedIn: isLoggedIn}});
});

app.get("/logout", (req, res) => {
    req.session.role="";
    res.redirect("/");
});

app.post("/auth", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        db.get(`SELECT * FROM users
        WHERE username = ?
        AND password = ?`,
        [username, password],
        (err, row) => {
            if (err) {
                console.log(err);
                res.render("pages/login", {data: {error_msg: "An error occured."}});
            } else if (!row) {
                console.log("Could not find user " + username);
                res.render("pages/login", {data: {error_msg: "Wrong username or password."}})
            } else {
                console.log(row.id + " : " + row.username);
                req.session.role = "jour";
                res.redirect("dashboard");
            }
        });
    }
});

app.get("/dashboard", (req, res) => {
    if(req.session.role === "jour"){
        res.render("pages/dashboard", {data: {isLoggedIn: true}});
    } else {
        res.redirect("/");
    }
});

// Volunteer Signup
app.get("/signup", (req, res) => {
    res.render("pages/signup");
});

app.get("/moreinfo", (req, res) => {
    res.render("pages/more_info");
});

// Temp array to keep ids who opened link.
let usersAnsweredYes = [];
let usersAnsweredNo = [];
app.get("/volunteer/:id", (req, res) => {
    if(usersAnsweredYes.includes(req.params.id)){
        res.render("pages/volunteer_dashboard", {data: {userid: req.params.id}});
    } else if (usersAnsweredNo.includes(req.params.id)){
        res.render("pages/volunteer_no");
    } else {
        res.render("pages/volunteer_confirm", {data: {userid: req.params.id}});
    }
});

app.get("/volunteer/:id/yes", (req, res) => {
    res.render("pages/volunteer_dashboard", {data: {userid: req.params.id}});
    usersAnsweredYes.push(req.params.id);
});

app.get("/volunteer/:id/no", (req, res) => {
    res.render("pages/volunteer_no", {data: {userid: req.params.id}});
    usersAnsweredNo.push(req.params.id);
});

app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
