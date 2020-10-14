const express = require("express");
const router = express.Router();

// This is currently not encrypting passwords for development/mockup purposes
// Encryption will probably be some kind of slow implementation such as bcrypt.
function hash(str) { return str; }

// Login/logout pages
router.get("/login", (req, res) => {
    res.render("pages/login");
});
router.get("/logout", (req, res) => {
    req.session.role="";
    res.redirect("/");
});

// Login post, password will be encrypted with the `hash` function
router.post("/auth", (req, res) => {
    const username = req.body.username;
    const password = hash(req.body.password);

    if (username && password) {
        req.db.getConnection()
            .then(conn => {
                conn.query(`SELECT * FROM jour WHERE username = ? AND password = ?`,[username, password])
                .then(rows => {
                    if(rows.length){
                        req.session.role = "jour";
                        res.redirect("/jour/dashboard");
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

// Dashboard for the jour memeber
router.get("/dashboard", (req, res) => {
    res.render("pages/dashboard");
});

// Dashbard for a specific emergency
router.get("/dashboard/:id", (req, res) => {
    req.db.getConnection()
        .then(conn => {
            conn.query(`SELECT * FROM emergencies WHERE id = ?`, [req.params.id])
            .then(rows => {
                if(rows.length){
                    res.render("pages/emergency_dashboard",{data: {row: rows[0]}});
                } else {
                    console.log("Could not find any emergency with id: " + req.params.id);
                    res.redirect("/jour/dashboard");
                }
            }).then((_) => conn.end())
            .catch(err => {
                console.log(err);
                conn.end();
                res.redirect("/jour/dashboard");
            });
        })
});

module.exports = router;
