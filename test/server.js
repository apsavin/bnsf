var checkPages = require('./server-helpers').checkPages,
    request = require('request');

module.exports.getConfig = function (paths) {
    var replaceCSS = require('./helpers').getReplaceCSS(paths.CSS);
    return checkPages([
        ['/', 200, 'main page'],
        ['/page-with-redirect', 200, 'main page'],
        ['/dynamic-page', 200, 'dynamic page'],
        ['/dynamic-page-with-params', 200, 'dynamic page with get params', 'node_modules'],
        ['/dynamic-page-with-params?tech=js', 200, 'dynamic page with get params', 'node_modules'],
        {
            params: ['/dynamic-page-with-params?tech=css', 404, '404 not found'],
            config: {
                'with file': checkPages([{
                    topic: replaceCSS(function (callback) {
                        request('http://localhost:3000/dynamic-page-with-params?tech=css', callback);
                    }),
                    params: ['/dynamic-page-with-params?tech=css', 200, 'dynamic page with get params', '1']
                }])
            }
        },
        ['/page-with-cookies', 200, 'page with cookies', '{}'],
        ['/page-with-several-requests-in-block', 200, 'page with several requests in block', '112']
    ]);
};
