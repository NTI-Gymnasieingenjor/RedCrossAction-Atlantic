const svenskaLan = [
  {
    "name": "Blekinge",
    "slug": "blekinge"
  },
  {
    "name": "Dalarna",
    "slug": "dalarna"
  },
  {
    "name": "Gotland",
    "slug": "gotland"
  },
  {
    "name": "Gävleborg",
    "slug": "gavleborg"
  },
  {
    "name": "Halland",
    "slug": "halland"
  },
  {
    "name": "Jämtland",
    "slug": "jamtland"
  },
  {
    "name": "Jönköping",
    "slug": "jonkoping"
  },
  {
    "name": "Kalmar",
    "slug": "kalmar"
  },
  {
    "name": "Kronoberg",
    "slug": "kronoberg"
  },
  {
    "name": "Norrbotten",
    "slug": "norrbotten"
  },
  {
    "name": "Skåne",
    "slug": "skane"
  },
  {
    "name": "Stockholm",
    "slug": "stockholm"
  },
  {
    "name": "Södermanland",
    "slug": "sodermanland"
  },
  {
    "name": "Uppsala",
    "slug": "uppsala"
  },
  {
    "name": "Värmland",
    "slug": "varmland"
  },
  {
    "name": "Västerbotten",
    "slug": "vasterbotten"
  },
  {
    "name": "Västernorrland",
    "slug": "vasternorrland"
  },
  {
    "name": "Västra Götaland",
    "slug": "vastra-gotaland"
  },
  {
    "name": "Örebro",
    "slug": "orebro"
  },
  {
    "name": "Östergötaland",
    "slug": "ostergotaland"
  }
];

function clearAllFields() {
    $("#crisis-mailing-form :input").each(function(){
        $(this).val("");
    });
    $("#crisis-mailing-form textarea").val("");
}

function handleCrisisInfoMsgChange() {
    let crisisInfoMsg = $("#textarea2").val();
    let marginTop = $("#textarea2").offset().top - $(".container > .row").offset().top;
    $("#sms-draft").css("margin-top", marginTop);

    if(crisisInfoMsg.length)
        $("#sms-draft").html('<div class="card-panel white"><h5>Utkast för SMS</h5><p>Hej Kalle! <span id="crisis-info-msg" class="red-text">'+crisisInfoMsg+'</span>. Kan du delta som volontär? Klicka här: https://www.rodakorset.se/volunteer/token</p></div>');
    else
        $("#sms-draft").html("");
}

function sendEmergencyRequest(){
    let crisisMsg = $("#textarea2").val();
    let areas = $("select").val();

    let body = JSON.stringify({
        emergency_name: $("#notification-name").val(),
        volunteer_count: $("#volunteers-needed").val(),
        equipment_list: $("#clothing-gear-needed").val(),
        assembly_point: $("#samlingsplats").val(),
        assembly_date: $("#datum").val(),
        assembly_time: $("#tidpunkt").val(),
        help_needed: $("#help_tasks").val(),
        sms_text: $("#textarea2").val(),
        areas: $("select").val(),
        more_info: $("#more-info-field").val()
    });

    fetch("/api/emergency/add", {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then(data => { window.location.replace("/jour/dashboard/"+data.emergency_id) });
}

function displayGraph(emergencyId, crisisName, volunteersNeeded){
    $("#kris-data").append('<div class="card-panel white"><h6>' + crisisName + '</h6></div>')
    $("#kris-data > .card-panel").append("<canvas id=\"myChart\"></canvas>");
   
    let ctx;
    let chart;
    fetch("/api/emergency/" + emergencyId + "/volunteers").then(res => res.json()).then(data => {
        ctx = document.getElementById('myChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ja', 'Nej', 'Obesvarat'],
                datasets: [{
                    label: "Volontär svar",
                    backgroundColor: [
                        "#4caf50",
                        "#f44336",
                        "#bdbdbd"
                    ],
                    data: [data.yes, data.no, data.sent - data.yes - data.no]
                }]
            },

            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: data.sent
                        }
                    }]
                },
                legend: {
                    display: true,
                    labels: {
                        fontColor: 'rgb(0,0,0)',
                        fontSize: 16,
                        generateLabels: function(chart) {
                            labels = Chart.defaults.global.legend.labels.generateLabels(chart);
                            for (var key in labels) {
                                labels[key].text = "Svar från volontärer.";
                                labels[key].fillStyle = "rgb(255, 255, 255)";
                                labels[key].strokeStyle = "rgb(255, 255, 255)";
                            }
                            return labels;
                        }
                    }
                },
            }
        });
    });

    let yes = 0;
    let tid = window.setInterval(() => {
        fetch("/api/emergency/"+emergencyId+"/volunteers").then(res => res.json()).then(data => {
            let count = data.sent;
            let yes = data.yes;
            let no = data.no;
            chart.data.datasets[0].data[0] = yes;
            chart.data.datasets[0].data[1] = no;
            chart.data.datasets[0].data[2] = count - yes - no;
            chart.update();
        });
    }, 3000);
}

function displayVolunteerTipMessages() {
    const pad = (str) => {
        return ("0"+str).slice(-2);
    };
    // Simulates fake info/tip from volunteer.
    let listOfMessages = ["Ska jag ta med gummistövlar?", "Jag har en traktor, hjälper det om jag tar med den?", "Är det ok om mina två döttrar, en 16åring och en 13åring, följer med?", "Jag har inga arbetshandskar, finns det att låna?"];
    let messageInterval = window.setInterval(() => {
        if(listOfMessages.length){
            let msg = listOfMessages.shift();
            let now = new Date();
            let timestamp = `${now.getDate()}/${now.getMonth()}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
            $("#info-tip-list").prepend('<div class="card-panel teal info-msg"><span class="time-stamp grey-text text-lighten-2">' + timestamp + '</span><span class="white-text">' + msg + '</span></div>');
        } else {
            clearInterval(messageInterval);
        }
    }, 10000)
}


function handleCrisisMailing(e){
    e.preventDefault();

    let listOfSelectedOptions = [];
    $("select option").each(function() {
        if($(this).is(':selected')){
            listOfSelectedOptions.push($(this))
        }
    });

    if(listOfSelectedOptions.length === 0){
        $("#error-prompt").text("Du måste välja minst ett område");
        return false;
    }

    sendEmergencyRequest();

    clearAllFields();
    handleCrisisInfoMsgChange();
}

function handleMoreInfoToggle(e) {
    if (e.target.checked) {
        $("#more-info-field").append('<textarea class="materialize-textarea" placeholder="Mer info angående krisen" id="textarea3"></textarea></div>')
    } else {
        $("#more-info-field").html("");
    }
}

function updateChartData(chart, dataIndex, amount){
    chart.data.datasets[0].data[dataIndex] += amount;
    chart.update();
}
