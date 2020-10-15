const md5 = require('md5');
const fetch = require('node-fetch');
const express = require("express");
const router = express.Router();



// Generate a invite token for volunteers
function generateToken(emergencyId, volunteerId, db){
    let token = md5(emergencyId + volunteerId + getRandomString(32));
    db.query("INSERT INTO invites (token, emergency_id, volunteer_id) VALUES (?,?,?)", [ token, emergencyId, volunteerId ]);
    return token;
}

// Use the 46elks API to send SMS to volunteers
// username and password for the API can be stored in the
// 46ELKS_API_USERNAME and 46ELKS_API_PASSWORD env variables
function sendSMS(phoneNumber, name, smsText, token, db) {
    const username = process.env["46ELKS_API_USERNAME"]
    const password = process.env["46ELKS_API_PASSWORD"]

    let url = "https://api.46elks.com/a1/SMS"
    let message = "Hej " + name + "! " + smsText + ". Kan du delta som volontär? Klicka här: http"+(process.env.ssl ? "s": "") +"://"+process.env.url+"/volunteer/" + token
    console.log(message);
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
        db.query("UPDATE invites SET sent = 1 WHERE token = ?", [ token ]);
    });
}

// Add a new emergency and send out SMS for volunteers in the affected areas
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
    if(typeof affected_areas === "string") affected_areas = [ affected_areas ];
    req.db.query("INSERT INTO emergencies (id, name, volunteers_needed, equipment, assembly, info, affected_areas) VALUES (?, ?, ?, ?, ?, ?, ?)",[
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
    ], (err, result, fields) => {
        if (err) {
            console.log(err);
            res.json({err: err});
        }
    });

    // Building our query dynamically.
    // This needs to be done to check the JSON in the database
    let query = "SELECT * FROM volunteer WHERE active=1 AND (";
    query += affected_areas.map(_ => "JSON_CONTAINS(county, ?)").join(" OR ");
    query+=")";
    let sent_count = 0;

    req.db.query(query, affected_areas.map(area => '"' + area +'"'),
    (err, result, fields) => {
        if(err) console.log(err);
        else {
            sent_count = result.length;
            result.forEach(row => {
               let token = generateToken(id, row.id, req.db)
               sendSMS(row.phone, row.name, sms_text, token, req.db)
            });
        }
    });

   res.json({
      emergency_id: id,
      sms_count: sent_count
   });
});

// Get status and information about a emergency by id
router.get('/emergency/:id', (req, res) => {
    //if(!res.locals.isLoggedIn) return res.send("Unauthorized");
    req.db.query("SELECT * FROM emergencies WHERE id = ?", [ req.params.id ],
    (err, result, fields) => {
        if(err) {
            console.log(err);
            res.json({err: "Something went wrong."});
        } else {
            let row = result[0];
            row["assembly"] = JSON.parse(row["assembly"])
            row["info"] = JSON.parse(row["info"])
            row["affected_areas"] = JSON.parse(row["affected_areas"])
            res.json(row);
        }
    });
});

// Get information about the volunteers for emergency by id.
// This will return how many volunteers have been invited, as well as
// the amount of answers of yes and no.
router.get('/emergency/:id/volunteers', (req, res) => {
    req.db.query("SELECT status FROM invites WHERE emergency_id = ?", [ req.params.id ],
    (err, result, fields) => {
        if(err) {
            console.log(err);
            res.json({err:"Invalid emergency"});
        } else {
            res.json({
                yes: result.filter(el => el.status == 2).length,
                no: result.filter(el => el.status == 1).length,
                sent: result.length
            });
        }
    })
});

module.exports = router;



// Helper functions
function getRandomString(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
