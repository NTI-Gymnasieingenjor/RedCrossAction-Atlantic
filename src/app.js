const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const helmet = require('helmet');
const mariadb = require("mariadb");
const mysql = require("mysql");

require('dotenv').config({path: __dirname + '/../.env'});

const app = express();
const port = 8080;

// Enable pretty compiled HTML for dev environment
if (app.get('env') === 'development') {
    app.locals.pretty = true;
}

// Enable PUG as template engine
app.set("view engine", "pug");

// Enable static resources
app.use(express.static('public'));

// Enable security settings
app.use(helmet(
    {
        contentSecurityPolicy: false,
        hsts: false,
    }
));

// Eanble sessions
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "secret"
}));

// Add a body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Middleware for checking if the user is logged in
app.use(function(req, res, next) {
    let isLoggedIn = req.session.role == "jour";
    res.locals.isLoggedIn = isLoggedIn;
    next();
});

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect(err => {
    if(err) console.error("Error connecting: " + err.stack);
});
// Middleware for creating a db per request
app.use(function(req, res, next) {
    //req.db = mariadb.createPool({
    //    host: process.env.DB_HOST,
    //    user: process.env.DB_USER,
    //    password: process.env.DB_PASSWORD,
    //    database: process.env.DB_NAME,
    //    connectionLimit: 5
    //});
    req.db = connection;

    next();
})

// Routes
app.get("/", (req, res) => {
    //res.render("pages/home");
    res.render("pages/signup");
});
app.use('/api', require("./routes/api"));
app.use('/volunteer', require("./routes/volunteer"));
app.use('/jour', require("./routes/jour"))


app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});

//connection.destroy();
