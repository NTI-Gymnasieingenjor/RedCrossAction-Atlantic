const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const helmet = require('helmet');
const mariadb = require("mariadb");

require('dotenv').config({path: __dirname + '/../.env'});

const app = express();
const port = 8080;


app.set("view engine", "pug");
app.use(express.static('public'));
app.use(helmet(
    {
        contentSecurityPolicy: false,
        hsts: false,
    }
));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "secret"
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    let isLoggedIn = req.session.role == "jour";
    res.locals.isLoggedIn = isLoggedIn;
    next();
});

app.use(function(req, res, next) {
    req.db = mariadb.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: 5
    });
    next();
})

app.get("/", (req, res) => {
    res.render("pages/home");
});
app.use('/api', require("./routes/api"));
app.use('/volunteer', require("./routes/volunteer"));
app.use('/jour', require("./routes/jour"))


app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
