modules.define('api-requester', ['app-api-router', 'vow'], function (provide, router, Vow, ApiRequester) {
    "use strict";

    var request = require('request');

    provide(ApiRequester.decl({

        sendRequest: function (method, route, routeParams, body) {
            var url = router.generate(route, routeParams),
                deferred = Vow.defer();
            console.log(route, routeParams, url);
            request({
                url: url,
                method: method,
                body: body
            }, function (err, res, body) {
                var output = {
                    error: err ? err.message : '',
                    body: body
                };
                if (res) {
                    output.response = {
                        statusCode: res.statusCode,
                        statusText: res.statusText
                    }
                }
                if (err || res && (res.statusCode < 200 || res.statusCode > 299)) {
                    console.log(err);
                }
                deferred.resolve(output)
            });
            return deferred.promise();
        }

    }));

});

