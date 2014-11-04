'use strict';

var http = require('http');
var url = require('url');

if (process.argv.length != 3) {
    console.log("Usage: node server.js hostname");
    process.kill();
}

var hostName = process.argv[2];
console.log("Scan for " + hostName);

var server = http.createServer(function (request, response) {

        var requestBody = '';
        // we want to get the data as utf8 strings
        // If you don't set an encoding, then you'll get Buffer objects
        request.setEncoding('utf8');
        response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');
        response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Readable streams emit 'data' events once a listener is added
        request.on('data', function (chunk) {
            requestBody += chunk;
        });

        // the end event tells you that you have entire requestBody
        request.on('end', function () {
            try {
                if (request.method == "OPTIONS") {
                    response.end();
                    return;
                }

                var data = JSON.parse(requestBody);
                console.log("Received request for " + data.url);

                var parseUrl = url.parse(data.url);

                console.log("Url Hostname=" + parseUrl.hostname);
                if (parseUrl.hostname == null && data.hostname != null) {
                    console.log("Hostname in request="+data.hostname);
                    parseUrl.hostname = data.hostname;
                }

                if (parseUrl.hostname == null)
                    parseUrl.hostname = hostName;

                if (parseUrl.hostname != hostName) {
                    console.log("Hostname doesn't match " + parseUrl.hostname + ' ' + hostName);
                    response.end(JSON.stringify({returnCode: 'KO', page: parseUrl.path}));
                    return;
                }

                var options = {
                    hostname: parseUrl.hostname,
                    port: parseUrl.port,
                    path: parseUrl.path,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.94 Safari/537.36",
                        "Accept": "text/html",
                        "Authorization": "Basic b2s6b2s="
//                        "host": "www.fortuneo.fr",
//                        "Referer": "http://www.fortuneo.fr/ad/ad.jsp?format=3721&isMaster=0",
//                        "Cookie": "FORTUNEO_HTTP=2639226140faacbd2cb345e1503f3bf45444bd6da512a708c92e0dd65be65023be2a2d52b54a7337; JSESSIONID=8A8ECF587BF8AC606FB8627355FED2FF-n2.ffront1a; __utma=61193915.1668597646.1411482456.1411482456.1411482456.1; __utmb=61193915.1.10.1411482456; __utmc=61193915; __utmz=61193915.1411482456.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); etuix=OSG5wTC5mcOuaOLH6FCmUiIkOAxx4oob0TGNugMaL_P.iB6oIDtxqw--"
                    }
                };

                var result = {returnCode: 'OK', page: parseUrl.pathname, withParameter: parseUrl.search != null ? true : false, queryString: parseUrl.search};

                http.get(options,function (clientResponse) {
                    var responseBody = "";
                    result.responseCode = clientResponse.statusCode;
                    result.location = clientResponse.headers.location;
                    clientResponse.on('data', function (chunk) {
                        responseBody += chunk;
                    });
                    clientResponse.on("end", function () {
                        console.log("Received content");
                        result.content = responseBody;
                        response.end(JSON.stringify(result));
                    });
                }).on("error", function (e) {
                    console.log(e.message);
                    response.end(JSON.stringify(result));
                });
                ;
            }
            catch
                (er) {
                console.log("error" + er);
                // uh oh!  bad json!
                response.statusCode = 400;
                return response.end('error: ' + er.message);
            }

        })
        ;
    })
    ;
server.listen(8080, "localhost");
