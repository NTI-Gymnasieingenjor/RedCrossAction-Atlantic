const bodyParser = require('body-parser');
const express = require("express");
const session = require('express-session');
const sqlite3 = require("sqlite3");
const https = require('https')
const querystring = require('querystring')
const helmet = require('helmet');

require('dotenv').config({path: __dirname + '/../.env'});

const app = express();
const port = 8080;

const db = new sqlite3.Database("./test.db", sqlite3.OPEN_READONLY, err => {
    if (err)
        console.error(err);
});

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

app.get("/", (req, res) => {
    res.render("pages/home");
});

app.get("/login", (req, res) => {
    res.render("pages/login");
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


// Handles volunteer registration
let registeredVolunteers = [];
app.post("/signup", (req, res) => {
    const firstName = req.body.firstname;
    const phoneNumber = req.body.phonenumber;
    const area = req.body.area;

    registeredVolunteers.push({
        firstName: firstName,
        phoneNumber: phoneNumber,
        area: area
    });

    res.redirect("/");
});

app.post("/send-sms", (req, res) => {
    const crisisMsg = req.body.crisisMsg
    const areas = req.body.areas

    let listOfVolunteers = [];
    registeredVolunteers.forEach((volun) => {
        // Checks if volunteer only selected 1 area
        if(typeof volun.area === "string"){
            if (areas.includes(volun.area)) {
                listOfVolunteers.push(volun)
            }
        } else {
            // Checks if volunteer has selected any of the crisis areas
            let matchingAreas = areas.filter((area, indx) => volun.area.includes(area))
            if(matchingAreas.length > 0){
                listOfVolunteers.push(volun)
            }
        }
    });

    const username = process.env["API_USERNAME"]
    const password = process.env["API_PASSWORD"]

    let sentSMS = []

    listOfVolunteers.forEach((volunteer) => {
        const postFields = {
            dryrun:  "yes",
            from:    "RK",
            to:      volunteer.phoneNumber,
            message: "Hej " + volunteer.firstName + "! " + crisisMsg + ". Har du möjlighet att delta som volontär? Klicka här för mer information: https://www.rodakorset.se/volunteer/" + volunteer.firstName
        }

        const key = new Buffer(username + ':' + password).toString('base64')
        const postData = querystring.stringify(postFields)

        const options = {
            hostname: 'api.46elks.com',
            path:     '/a1/SMS',
            method:   'POST',
            headers:  {
                'Authorization': 'Basic ' + key
            }
        }

        const callback = (response) => {
            var str = ''
            response.on('data', (chunk) => {
                str += chunk
            })

            response.on('end', () => {
                console.log(str)
                sentSMS.push(str);
            })
        }

        var request = https.request(options, callback)
        request.write(postData)
        request.end() 
    });

    res.json(sentSMS);
});

app.get("/dashboard", (req, res) => {
    if(res.locals.isLoggedIn){
        res.render("pages/dashboard");
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
        res.render("volunteer/dashboard", {data: {userid: req.params.id}});
    } else if (usersAnsweredNo.includes(req.params.id)){
        res.render("volunteer/no");
    } else {
        res.render("volunteer/confirm", {data: {userid: req.params.id}});
    }
});

app.get("/volunteer/:id/yes", (req, res) => {
    res.render("volunteer/dashboard", {data: {userid: req.params.id}});
    usersAnsweredYes.push(req.params.id);
});

app.get("/volunteer/:id/no", (req, res) => {
    res.render("volunteer/no", {data: {userid: req.params.id}});
    usersAnsweredNo.push(req.params.id);
});

app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
