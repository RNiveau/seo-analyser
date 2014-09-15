'use strict';

var http = require('http');
var url = require('url');

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
            var data = JSON.parse(requestBody);
            console.log("Received request for "+ data.url);

            var parseUrl = url.parse(data.url);

            var options = {
                hostname: parseUrl.hostname,
                port: parseUrl.port,
                path: parseUrl.path
            };

            var result = {page: parseUrl.pathname, withParameter: parseUrl.search != null ? true : false, queryString: parseUrl.search};

            http.get(options, function (clientResponse) {
                var responseBody = "";
                clientResponse.on('data', function (chunk) {
                    responseBody += chunk;
                });
                clientResponse.on("end", function () {
                    console.log("Received content");
                    result.content = responseBody;
                    response.end(JSON.stringify(result));
                });
            });
        } catch (er) {
            console.log("error" + er);
            // uh oh!  bad json!
            response.statusCode = 400;
            return response.end('error: ' + er.message);
        }

    });
});
server.listen(8080, "localhost");
