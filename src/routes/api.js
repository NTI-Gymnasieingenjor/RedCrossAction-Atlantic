const md5 = require('md5');
const fetch = require('node-fetch');
const express = require("express");
const router = express.Router();


function getRandomString(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function generateToken(emergencyId, volunteerId, db){
    let token = md5(emergencyId + volunteerId + getRandomString(32));
    db.getConnection()
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
        req.db.getConnection()
        .then(conn => conn.query(`UPDATE invites SET sent = 1 WHERE token = ?`, [token]).then((_) => conn.end()).catch(err => conn.end()))
    });
}

router.post("/emergency/add", (req, res) => {
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

    req.db.getConnection()
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

    req.db.getConnection()
    .then(conn => {
        conn.query(query, affected_areas.map(area => '"' + area + '"')) // Add quotations to be able to use JSON_CONTAINS
        .then(rows => {
            rows.forEach(row => {
                let token = generateToken(id, row.id, req.db)
                sendSMS(row.phone, row.name, sms_text, token)
            });
        })
        .then((_) => conn.end())
        .catch(err => {console.log(err); conn.end()});
    });
    res.json({emergency_id: id});
});

router.get('/emergency/:id', (req, res) => {
    //if(!res.locals.isLoggedIn) return res.send("Unauthorized");
    req.db.getConnection()
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

router.get('/emergency/:id/volunteers', (req, res) => {
    res.json({
        yes: usersAnsweredYes.length,
        no: userAsnweredNo.length
    });
});

module.exports = router;
