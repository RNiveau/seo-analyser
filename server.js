var http = require('http');
var url = require('url');

var server = http.createServer(function (request, response) {

    var body = '';
    // we want to get the data as utf8 strings
    // If you don't set an encoding, then you'll get Buffer objects
    request.setEncoding('utf8');

    // Readable streams emit 'data' events once a listener is added
    request.on('data', function (chunk) {
        body += chunk;
    });

    // the end event tells you that you have entire body
    request.on('end', function () {
        try {
            console.log(body);
            console.log(request.method);
            var data = JSON.parse(body);
            http.get(data.url, function (res) {
                res.on("end", function (body) {
                   console.log("yes");
                });
                res.on("onBody", function (body) {
                    response.end(body);
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
