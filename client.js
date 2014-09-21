'use strict';

function scanUrl(url) {
    $.ajax({
        url: "http://localhost:8080",
        crossDomain: true,
        type: "POST",
        data: JSON.stringify({url: url}),
        success: function (data) {
            var json = JSON.parse(data);
            if (json.returnCode == 'KO') {
                $("body").append('<div>' + json.page + ' n\'est pas dans le domaine analysé</div>');
            } else {
                var name = 'Nom de la page: ' + json.page;
                var response = 'Réponse http: ' + json.responseCode;
                var parameters = 'Page avec paramètre: ' + (json.withParameter ? 'Oui ' + json.queryString : 'Non');
                var link = 'Nombre de liens : ' + $(json.content).find('a').length;
                var title = "Title: AUCUN";
                var location = json.location != null ? 'New location: ' + json.location + '<br/>' : '<br/>';
                if ($(json.content).filter('title').length > 0)
                    title = 'Title: ' + $(json.content).filter('title')[0].text;
                $("body").append('<div>' + name + '<br/>' + response + '<br/>' + parameters + '<br/>' + link + '' +
                    '<br/>' + title + '<br/>' + location + '</div>');
                if (json.location != null)
                    scanUrl(json.location);
            }
        }});
}

$(document).ready(function () {
    scanUrl("http://google.fr");
});