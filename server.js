var http = require('http');

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
            var data = JSON.parse(body);
        } catch (er) {
            // uh oh!  bad json!
            response.statusCode = 400;
            return response.end('error: ' + er.message);
        }

    });
    response.end();
});
server.listen(8080, "localhost");
