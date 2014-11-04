'use strict';

var app = angular.module('app', []);

var thiss = null;

app.config(function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
});


app.controller('SeoController', ['$scope', '$http', function ($scope, $http) {

    thiss = this;

    this.withoutTitle = {total: 0, pages: []};

    this.withParameters = {total: 0, pages: []};

    this.error404 = {total: 0, pages: []};

    this.error30x = {total: 0, pages: []};

    this.scanned = 0;

    this.outLink = 0;

    this.firstUrl;

    this.tree = {};

    this.levels = [];

    this.run = function () {
        this.scanUrl(this.firstUrl, null, null, 0, null);
    };

    this.scanUrl = function (url, search, host, level, referer) {

        if (level > 10)
            return;
        var page = this.tree[url];
        if (page != null && page != undefined) {
            page.linkIn++;
            if (level < page.levels) {
                page.levels = level;
                this.levels[level]++;
                this.levels[page.level]--;
            }
            return;
        } else {
            this.tree[url] = {url: url, linkIn: 1, levels: level, anchor: 0, isOutPage: false, referer: referer};
        }

        if (this.levels[level] == undefined)
            this.levels[level] = 1;
        else
            this.levels[level]++;

        if (host == "localhost")
            host = null;

        if (search != null && search != "") {
            url += search;
            this.withParameters.total++;
            this.withParameters.pages.push(url);
        }

        $http({
            url: "http://localhost:8080",
            method: "POST",
            data: JSON.stringify({url: url, hostname: host})})
            .success(angular.bind(this, function (json) {
                if (json.returnCode == 'KO') {
                    this.tree[url].isOutPage = true;
                    this.outLink++;
                } else {
                    this.scanned++;

                    if (json.responseCode == 404) {
                        this.error404.total++;
                        this.error404.pages.push(this.tree[url]);
                        return;
                    }

                    var name = 'Nom de la page: ' + json.page;
                    var response = 'Réponse http: ' + json.responseCode;
                    var parameters = 'Page avec paramètre: ' + (json.withParameter ? 'Oui ' + json.queryString : 'Non');
                    var links = jQuery(json.content).find('a');
                    var textLink = 'Nombre de liens : ' + links.length;
                    var title = "Title: AUCUN";
                    var location = json.location != null ? 'New location: ' + json.location + '<br/>' : '<br/>';
                    if (jQuery(json.content).filter('title').length > 0)
                        title = 'Title: ' + jQuery(json.content).filter('title')[0].text;
                    else {
                        this.withoutTitle.total++;
                        this.withoutTitle.pages.push(json.page);
                    }
                    //jQuery("body").append('<div>' + name + '<br/>' + response + '<br/>' + parameters + '<br/>' + textLink + '' +
                    //  '<br/>' + title + '<br/>' + location + '</div>');
                    if (json.location != null) {
                        this.error30x.total++;
                        this.error30x.pages.push(json.page);
                        this.scanUrl(json.location, null, null, level + 1, url);
                    }
                    this.tree[url].outLink = links.size();
                    links.each(angular.bind(this, function (index, link) {
                        if (link.pathname == url && link.hash !== "") {
                            this.tree[url].anchor++;
                        } else if (!link.pathname.match(/@/g) && !link.pathname.match(/\.(png)|(jpg)|(gif)$/g))
                            this.scanUrl(link.pathname, link.search, link.hostname, level + 1, url);
                    }));
                }
            }));
    }

}]);

jQuery.noConflict();
//    scanUrl("/2014/09/01/javafx-8-la-resistance-des-applications-lourdes/", null, 0);