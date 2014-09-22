'use strict';

var nbrWithoutTitle = 0;

var tree = {};

function scanUrl(url, search, level) {

    if (level > 1)
        return;
    var page = tree[url];
    if (page != null && page != undefined) {
        page.linkIn++;
        if (level < page.level)
            page.level = level;
        return;
    }

    if (search != null && search != "")
        url += search;

    $.ajax({
        url: "http://localhost:8080",
        crossDomain: true,
        type: "POST",
        async: false,
        data: JSON.stringify({url: url}),
        success: function (data) {
            var json = JSON.parse(data);
            if (json.returnCode == 'KO') {
                $("body").append('<div>' + json.page + ' n\'est pas dans le domaine analysé</div>');
            } else {
                tree[json.page] = {linkIn: 1, level: level};
                var name = 'Nom de la page: ' + json.page;
                var response = 'Réponse http: ' + json.responseCode;
                var parameters = 'Page avec paramètre: ' + (json.withParameter ? 'Oui ' + json.queryString : 'Non');
                var links = $(json.content).find('a');
                var textLink = 'Nombre de liens : ' + links.length;
                var title = "Title: AUCUN";
                var location = json.location != null ? 'New location: ' + json.location + '<br/>' : '<br/>';
                if ($(json.content).filter('title').length > 0)
                    title = 'Title: ' + $(json.content).filter('title')[0].text;
                else
                    nbrWithoutTitle++;
                $("body").append('<div>' + name + '<br/>' + response + '<br/>' + parameters + '<br/>' + textLink + '' +
                    '<br/>' + title + '<br/>' + location + '</div>');
                if (json.location != null)
                    scanUrl(json.location);
                links.each(function (index, link) {
                    if (!link.pathname.match(/@/g) && !link.pathname.match(/\.(png)|(jpg)|(gif)$/g))
                        scanUrl(link.pathname, link.search, level + 1);
                });
            }
        }});
}

$(document).ready(function () {
    scanUrl("/2014/09/01/javafx-8-la-resistance-des-applications-lourdes/", null, 0);
});