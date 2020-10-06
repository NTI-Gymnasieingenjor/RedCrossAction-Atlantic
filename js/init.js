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
