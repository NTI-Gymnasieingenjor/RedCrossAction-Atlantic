const bodyParser = require('body-parser');
const express = require("express");
const session = require('express-session');
const helmet = require('helmet');
const md5 = require('md5');
const fetch = require('node-fetch');
const mariadb = require("mariadb");


require('dotenv').config({path: __dirname + '/../.env'});

const app = express();
const port = 8080;

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5
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

app.get("/moreinfo", (req, res) => {
    res.render("pages/more_info");
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
        pool.getConnection()
            .then(conn => {
                conn.query(`SELECT * FROM jour WHERE username = ? AND password = ?`,[username, password])
                .then(rows => {
                    if(rows.length){
                        req.session.role = "jour";
                        res.redirect("/dashboard");
                    } else {
                        res.render("pages/login", {data: {error_msg: "Wrong username or password."}})
                    }
                })
                .then(() => conn.end())
                .catch(err => {
                    res.render("pages/login", {data: {error_msg: "An error occured."}})
                    conn.end();
                })
            })
    }
});


// Volunteer Signup
app.get("/signup", (req, res) => {
    res.render("pages/signup");
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


// Middleware for /dashboard routes.
app.use("/dashboard", (req, res, next) => {
    //if(res.locals.isLoggedIn){
    next()
    //} else {
    //    res.redirect("/login")
    //}
});

app.get("/dashboard", (req, res) => {
    res.render("pages/dashboard");
});

app.get("/dashboard/:id", (req, res) => {
    pool.getConnection()
        .then(conn => {
            conn.query(`SELECT * FROM emergencies WHERE id = ?`, [req.params.id])
            .then(rows => {
                if(rows.length){
                    res.render("pages/emergency_dashboard",{data: {row: rows[0]}});
                } else {
                    console.log("Could not find any emergency with id: " + req.params.id);
                    res.redirect("/dashboard");
                }
            }).then((_) => conn.end())
            .catch(err => {
                console.log(err);
                conn.end();
                res.redirect("/dashboard");
            });
        })
});

app.get("/volunteer/:token", (req, res) => {
    pool.getConnection()
    .then(conn => {
        conn.query(`SELECT * FROM volunteer INNER JOIN invites ON volunteer.id = invites.volunteer_id WHERE invites.token = ?`, [req.params.token])
        .then(rows => {
            let row = rows[0]
            if(row.status == 0){
                res.render("volunteer/confirm", {data: {token: req.params.token, name: row.name, emergency_id: row.emergency_id}});
            } else if(row.status == 1) {
                res.render("volunteer/no");
            } else { 
                res.render("volunteer/dashboard", {data: {token: req.params.token, name: row.name, emergency_id: row.emergency_id}});
            }
            conn.release();
        })
        .then(() => conn.end())
        .catch(err => {
            console.log(err);
            res.redirect("/signup")
            conn.end();
        })
    })
});

app.get("/volunteer/:token/yes", (req, res) => {
    pool.getConnection()
    .then(conn => {
        conn.query(`UPDATE invites SET status=2 WHERE token = ?`, [req.params.token])
        .then((_) => res.redirect("/volunteer/"+ req.params.token))
        .then((_) => conn.end())
        .catch(err => {console.log(err);conn.end()})
    })
});

app.get("/volunteer/:token/no", (req, res) => {
    pool.getConnection()
    .then(conn => {
        conn.query(`UPDATE invites SET status=1 WHERE token = ?`, [req.params.token])
        .then((_) => res.redirect("/volunteer/"+ req.params.token))
        .then((_) => conn.end())
        .catch(err => {console.log(err); conn.end()})
    });
});

app.post("/api/emergency/add", (req, res) => {
    //if(!res.locals.isLoggedIn) return res.send("Unauthorized");
    let id = md5(req.body.emergency_name+new Date);
    let name = req.body.emergency_name;
    let vol_count = req.body.volunteer_count;
    let equipment = req.body.equipment_list;
    let assembly_point = req.body.assembly_point;
    let assembly_date = req.body.assembly_date;
    let assembly_time = req.body.assembly_time;
    let help_needed = req.body.help_needed;
    let sms_text = req.body.sms_text;
    let affected_areas = req.body.areas;
    let more_info = req.body.more_info ? req.body.more_info : "";

    console.log(help_needed);

    pool.getConnection()
    .then(conn => {
        conn.query(`INSERT INTO emergencies (id,name,volunteers_needed,equipment,assembly,info,affected_areas) VALUES (?,?,?,?,?,?,?)`, [
            id, 
            name, 
            vol_count, 
            equipment, 
            JSON.stringify({
                point: assembly_point,
                date: assembly_date,
                time: assembly_time
            }),
            JSON.stringify({
                help_needed: help_needed,
                sms_text: sms_text,
                more_info: more_info
            }),
            JSON.stringify(affected_areas)
        ])
        .then((_) => conn.end())
        .catch(err => {
            console.log(err);
            conn.end()
            res.json({err: err});
        });
    });
    
    // Building our query dynamically.
    let query = "SELECT * FROM volunteer WHERE active=1 AND (";
    query += affected_areas.map(area => "JSON_CONTAINS(county, ?)").join(" OR ");
    query+=")";
    
    pool.getConnection()
    .then(conn => {
        conn.query(query, affected_areas.map(area => '"' + area + '"')) // Add quotations to be able to use JSON_CONTAINS
        .then(rows => {
            rows.forEach(row => {
                let token = generateToken(id, row.id)
                sendSMS(row.phone, row.name, sms_text, token)
            });
        })
        .then((_) => conn.end())
        .catch(err => {console.log(err); conn.end()});
    });
    res.json({emergency_id: id});
});


function getRandomString(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function generateToken(emergencyId, volunteerId){
    let token = md5(emergencyId + volunteerId + getRandomString(32));
    pool.getConnection()
    .then(conn => {
        conn.query(`INSERT INTO invites (token, emergency_id, volunteer_id) VALUES (?,?,?)`, [token, emergencyId, volunteerId])
        .then((_) => conn.end())
        .catch(err => conn.end())
    });
    return token;
}

function sendSMS(phoneNumber, name, smsText, token) {
    const username = process.env["46ELKS_API_USERNAME"]
    const password = process.env["46ELKS_API_PASSWORD"]

    let url = "https://api.46elks.com/a1/SMS"
    let message = "Hej " + name + "! " + smsText + ". Kan du delta som volontär? Klicka här: https://rodakorset.se/volunteer/" + token
    const key = new Buffer(username + ':' + password).toString('base64')
    fetch("https://api.46elks.com/a1/sms", {
        body: "dryrun=yes&from=RK&to=" + phoneNumber + "&message=" + message,
        headers: {
            "Authorization": 'Basic ' + key,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    })
    .then(result => result.json())
    .then(data => {
        console.log(data);
        pool.getConnection()
        .then(conn => conn.query(`UPDATE invites SET sent = 1 WHERE token = ?`, [token]).then((_) => conn.end()).catch(err => conn.end()))
    });
}

app.get('/api/emergency/:id', (req, res) => {
    //if(!res.locals.isLoggedIn) return res.send("Unauthorized");
    pool.getConnection()
    .then(conn => {
        conn.query(`SELECT * FROM emergencies WHERE id = ?`, [req.params.id])
        .then(rows => {
            let row = rows[0]
            row["assembly"] = JSON.parse(row["assembly"])
            row["info"] = JSON.parse(row["info"])
            row["affected_areas"] = JSON.parse(row["affected_areas"])
            res.json(row);
        })
        .then((_) => conn.end())
        .catch(err => {
            console.log(err);
            res.json({err: "Something went wrong."})
            conn.end()
        });
    });
});

app.get('/api/emergency/:id/volunteers', (req, res) => {
    res.json({
        yes: usersAnsweredYes.length,
        no: userAsnweredNo.length
    });
});


app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
