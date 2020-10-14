$(document).ready(() => {
    svenskaLan.forEach((lan) => {
        let optionString = "<option value=\"" + lan.slug + "\">" + lan.name + "</option>";
        $('select').append(optionString); 
    });
    $('select').formSelect();
    $('.sidenav').sidenav();
    handleCrisisInfoMsgChange();
});