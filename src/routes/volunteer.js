const express = require("express");
const router = express.Router();

// Get more information about the emergency
// TODO: implement
router.get("/moreinfo", (req, res) => {
    res.render("pages/more_info");
});

// Volunteer Signup
router.get("/signup", (req, res) => {
    res.render("pages/signup");
});

// Handles volunteer registration
router.post("/signup", (req, res) => {
    const firstName = req.body.firstname;
    const phoneNumber = req.body.phonenumber;
    let area = req.body.area;

    if(typeof area === "string") {
        area = [ area ];
    }
    console.log(area);
    req.db.query("INSERT INTO volunteer (name, phone, county, active) VALUES (?,?,?,1)", [firstName, phoneNumber, JSON.stringify(area)],
    (err, result, fields) => {
        if(err) {
            console.log(err);
            res.render("pages/signup", {data: {error_msg: "Something went wrong."}});
        } else {
            res.redirect("/");
        }
    })
});

// Retrieve invite and information about emergency
router.get("/:token", (req, res) => {
    req.db.query("SELECT * FROM volunteer INNER JOIN invites ON volunteer.id = invites.volunteer_id WHERE invites.token = ?", [ req.params.token ],
    (err, result, fields) => {
        if(err || !result.length) {
            res.redirect("/volunteer/signup");
            console.log(err);
        } else {
            let row = result[0];
            if(row.status == 0){
                res.render("volunteer/confirm", {data: {token: req.params.token, name: row.name, emergency_id: row.emergency_id}});
            } else if(row.status == 1) {
                res.render("volunteer/no");
            } else {
                res.render("volunteer/dashboard", {data: {token: req.params.token, name: row.name, emergency_id: row.emergency_id}});
            }
        }
    });
});

// Accept emergency invitation
router.get("/:token/yes", (req, res) => {
    req.db.query("UPDATE invites SET status=2 WHERE token = ?", [ req.params.token ],
    (err, result, fields) => res.redirect("/volunteer/"+req.params.token) )
});

// Decline emergency invitation
router.get("/:token/no", (req, res) => {
    req.db.query("UPDATE invites SET status=1 WHERE token = ?", [ req.params.token ],
    (err, result, fields) => res.redirect("/volunteer/"+req.params.token) )
});

module.exports = router;
