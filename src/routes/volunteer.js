const express = require("express");
const router = express.Router();

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
    const area = req.body.area;
   
    console.log(area);

    req.db.getConnection()
    .then(conn => {
        conn.query(`INSERT INTO volunteer (name, phone, county, active) VALUES (?,?,?,?)`, [firstName, phoneNumber, JSON.stringify(area), 1])
        .then(rows => {
            res.redirect("/");
            conn.end();
        })
        .catch(err => {
            console.log(err);
            res.render("pages/signup", {data: {error_msg: "Something went wrong."}});
            conn.end();
        })
    });
});

router.get("/:token", (req, res) => {
    req.db.getConnection()
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
            res.redirect("/volunteer/signup")
            conn.end();
        })
    })
});

router.get("/:token/yes", (req, res) => {
    req.db.getConnection()
    .then(conn => {
        conn.query(`UPDATE invites SET status=2 WHERE token = ?`, [req.params.token])
        .then((_) => res.redirect("/volunteer/"+ req.params.token))
        .then((_) => conn.end())
        .catch(err => {console.log(err);conn.end()})
    })
});

router.get("/:token/no", (req, res) => {
    req.db.getConnection()
    .then(conn => {
        conn.query(`UPDATE invites SET status=1 WHERE token = ?`, [req.params.token])
        .then((_) => res.redirect("/volunteer/"+ req.params.token))
        .then((_) => conn.end())
        .catch(err => {console.log(err); conn.end()})
    });
});

module.exports = router;
