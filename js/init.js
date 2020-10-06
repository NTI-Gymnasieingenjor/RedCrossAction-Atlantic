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
});

function handleCrisisMailing(e){
    e.preventDefault();
    let crisisName = $("#notification-name").val()
    let volonteersNeeded = parseInt($("#volonteers-needed").val());
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
                data: [0, 0, volonteersNeeded]
            }]
        },

        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: volonteersNeeded
                    }
                }]
            }
        }
    });

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
}

function updateChartData(chart, dataIndex, amount){
    chart.data.datasets[0].data[dataIndex] += amount;
    chart.update();
}
