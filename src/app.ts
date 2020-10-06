import bodyParser from 'body-parser';
import express from "express";
import path from 'path';
import session from 'express-session';
import sqlite3 from "sqlite3"

const app = express();
const port = 8080;

const db = new sqlite3.Database("./test.db", sqlite3.OPEN_READONLY, err => {
    if (err)
        console.error(err);
});

app.set("view engine", "ejs");
app.use(express.static('public'))
app.use(session({
    resave: true,
    saveUnitialized: true,
    secret: "secret"
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



app.get("/", (_, res) => {
    res.render("pages/login");
});
app.post("/auth", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        console.log("wot");
        db.get(`SELECT * FROM users
        WHERE username = ?
        AND password = ?`,
        [username, password],
        (err, row) => {
            if (err) {
                console.log("oof");
            } else if (!row) {
                console.log("Could not find user " + username);
            } else {
                console.log(row.id + " : " + row.username);

            }
        });
    }
    res.send("oop");
    res.end();
});

app.get("/dashboard", (req, res) => {
    res.render("pages/dashboard");
});

app.get("/signup", (req, res) => {
    res.render("pages/signup");
});

// Temp array to keep ids who opened link.
let usersAnswered = [];
app.get("/volunteer/:id", (req, res) => {
    if(usersAnswered.includes(req.params.id)){
        res.render("pages/volunteer_dashboard", {data: {userid: req.params.id}});
    } else {
        res.render("pages/volunteer_confirm", {data: {userid: req.params.id}});
    }
});

app.get("/volunteer/:id/yes", (req, res) => {
    res.render("pages/volunteer_dashboard");
    usersAnswered.push(req.params.id);
});

app.get("/volunteer/:id/no", (req, res) => {
    res.render("pages/volunteer_no");
    usersAnswered.push(req.params.id);
});

app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
