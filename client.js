'use strict';

$.ajax({
    url: "http://localhost:8080",
    crossDomain: true,
    type: "POST",
    data: JSON.stringify({url: "http://blog.xebia.fr/2014/02/28/la-notion-de-bom-avec-maven/"}),
    success: function( data ) {
        var json = JSON.parse(data);
        $("body").text($(json.content).find('a').length);
}});