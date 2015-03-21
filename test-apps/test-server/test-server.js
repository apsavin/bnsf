var http = require('http');

function parseCookies (request) {
    var list = {},
        cookieHeader = request.headers.cookie;

    if (cookieHeader) {
        cookieHeader.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });
    }

    return list;
}

exports.server = http.createServer(function (req, res) {
    var cookies = parseCookies(req);
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': ['a=' + ((parseInt(cookies['a']) || 0) + 1), 'b=' + ((parseInt(cookies['b']) || 0) + 1)]
    });
    res.end(JSON.stringify(cookies));
}).listen(8081, '127.0.0.1');
