/**@module api-requester*/
modules.define('api-requester', ['app-api-router', 'vow'], function (provide, router, Vow, ApiRequester) {
    "use strict";

    var request = require('request');

    /**
     * @class ApiRequester
     * @extends BEM
     * @exports
     */
    provide(ApiRequester.decl(/**@lends ApiRequester.prototype*/{

        /**
         * @param {String} method
         * @param {String} route
         * @param {Object} routeParameters
         * @param {Object} [body]
         * @returns {vow:Promise}
         */
        sendRequest: function (method, route, routeParameters, body) {
            var url = router.generate(route, routeParameters),
                deferred = Vow.defer();
            console.log(route, routeParameters, url);
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

