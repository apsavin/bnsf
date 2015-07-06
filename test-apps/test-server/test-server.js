var http = require('http'),
    bodyParser = require('body-parser');

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

var serverCallback = require('connect')()
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(function (req, res) {
        var cookies = parseCookies(req),
            answer;
        switch (req.url.split('?')[0]) {
            case '/':
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Set-Cookie': ['a=' + ((parseInt(cookies['a']) || 0) + 1), 'b=' + ((parseInt(cookies['b']) || 0) + 1)]
                });
                answer = cookies;
                break;
            case '/is-first':
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Set-Cookie': 'first=false'
                });
                if (cookies.first === 'false') {
                    answer = 0;
                }
                answer = 1;
                break;
            case '/2':
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                answer = 2;
                break;
            case '/correct-post':
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                answer = req.body.response;
                break;
            case '/error-post/400':
                res.writeHead(400, {
                    'Content-Type': 'application/json'
                });
                answer = req.body.response;
                break;
            case '/error-post/500':
                res.writeHead(500, {
                    'Content-Type': 'application/json'
                });
                answer = req.body.response;
        }
        res.end(JSON.stringify(answer));
    });

exports.server = http.createServer(serverCallback).listen(8081, '127.0.0.1');
