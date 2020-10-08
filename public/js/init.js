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

(function($){
    $(function(){
        $('.sidenav').sidenav();
    });
})(jQuery);


$(document).ready(() => {
    svenskaLan.forEach((lan) => {
        let optionString = "<option value=\"" + lan.slug + "\">" + lan.name + "</option>";
        $('select').append(optionString); 
    });
    $('select').formSelect();
    handleCrisisInfoMsgChange();
});

function clearAllFields() {
    $("#crisis-mailing-form :input").each(function(){
        $(this).val("");
    });
    $("#crisis-mailing-form textarea").val("");
}

function handleCrisisInfoMsgChange() {
    let crisisInfoMsg = $("#textarea2").val();
    
    if(crisisInfoMsg.length)
        $("#sms-draft").html('<div class="card-panel white"><h5>Utkast för SMS</h5><p>Hej Kalle! <span id="crisis-info-msg" class="red-text">'+crisisInfoMsg+'</span>. Har du möjlighet att delta som volontär? Klicka här för mer information: https://www.rodakorset.se/volunteer</p></div>');
    else
        $("#sms-draft").html("");
}

function handleCrisisMailing(e){
    e.preventDefault();

    let crisisName = $("#notification-name").val()
    let volunteersNeeded = parseInt($("#volunteers-needed").val());
    $("#kris-data").append('<div class="card-panel white"><h6>' + crisisName + '</h6></div>')
    $("#kris-data > .card-panel").append("<canvas id=\"myChart\"></canvas>");
    
    let ctx = document.getElementById('myChart').getContext('2d');
    let chart = new Chart(ctx, {
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
                data: [0, 0, volunteersNeeded]
            }]
        },

        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: volunteersNeeded
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


    clearAllFields();
    handleCrisisInfoMsgChange();
    
    // Simulates fake data.
    let tid = window.setInterval(() => {
        if(chart.data.datasets[0].data[2] == 0){
            clearInterval(tid);
        } else {
            updateChartData(chart, 0, 1)
            updateChartData(chart, 2, -1)
        }
    }, 3000);
    let sid = window.setInterval(() => {
        if(chart.data.datasets[0].data[2] == 0){
            clearInterval(sid);
        } else {
            updateChartData(chart, 1, 1)
            updateChartData(chart, 2, -1)
        }
    }, 7000);

    // Simulates fake info/tip from volunteer.
    let listOfMessages = ["Ska jag ta med gummistövlar?", "Jag har en traktor, hjälper det om jag tar med den?", "Är det ok om mina två döttrar, en 16åring och en 13åring, följer med?", "Jag har inga arbetshandskar, finns det att låna?"];
    let messageInterval = window.setInterval(() => {
        if(listOfMessages.length){
            let msg = listOfMessages.shift();
            let now = new Date();
            let timestamp = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
            $("#info-tip-list").prepend('<div class="card-panel teal info-msg"><span class="time-stamp grey-text text-lighten-2">' + timestamp + '</span><span class="white-text">' + msg + '</span></div>');
        } else {
            clearInterval(messageInterval);
        }
    }, 10000)
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
