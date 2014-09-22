'use strict';

var app = angular.module('app', []);

app.config(function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
});


app.controller('SeoController', ['$scope', '$http', function ($scope, $http) {

    this.nbrWithoutTitle = 0,

    this.scanned = 0,

    this.firstUrl,

    this.tree = {},

    this.run = function () {
        this.scanUrl(this.firstUrl, null, 0);
    },

    this.scanUrl = function (url, search, level) {

        if (level > 1)
            return;
        var page = this.tree[url];
        if (page != null && page != undefined) {
            page.linkIn++;
            if (level < page.level)
                page.level = level;
            return;
        }

        if (search != null && search != "")
            url += search;

        $http({
            url: "http://localhost:8080",
            crossDomain: true,
            method: "POST",
            data: JSON.stringify({url: url})})
            .success(angular.bind(this, function (data) {
                var json = JSON.parse(data);
                if (json.returnCode == 'KO') {
                   // jQuery("body").append('<div>' + json.page + ' n\'est pas dans le domaine analysé</div>');
                } else {
                    this.tree[json.page] = {linkIn: 1, level: level};
                    this.scanned++;
                    var name = 'Nom de la page: ' + json.page;
                    var response = 'Réponse http: ' + json.responseCode;
                    var parameters = 'Page avec paramètre: ' + (json.withParameter ? 'Oui ' + json.queryString : 'Non');
                    var links = jQuery(json.content).find('a');
                    var textLink = 'Nombre de liens : ' + links.length;
                    var title = "Title: AUCUN";
                    var location = json.location != null ? 'New location: ' + json.location + '<br/>' : '<br/>';
                    if (jQuery(json.content).filter('title').length > 0)
                        title = 'Title: ' + jQuery(json.content).filter('title')[0].text;
                    else
                        nbrWithoutTitle++;
                    //jQuery("body").append('<div>' + name + '<br/>' + response + '<br/>' + parameters + '<br/>' + textLink + '' +
                      //  '<br/>' + title + '<br/>' + location + '</div>');
                    if (json.location != null)
                        this.scanUrl(json.location);
                    links.each(function (index, link) {
                        if (!link.pathname.match(/@/g) && !link.pathname.match(/\.(png)|(jpg)|(gif)$/g))
                            this.scanUrl(link.pathname, link.search, level + 1);
                    });
                }
            }));
    }

}]);

jQuery.noConflict();
//    scanUrl("/2014/09/01/javafx-8-la-resistance-des-applications-lourdes/", null, 0);