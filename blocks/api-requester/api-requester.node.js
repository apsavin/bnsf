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
         * @param {String} [route]
         * @param {Object} [routeParameters]
         * @param {String|Object} [body]
         * @returns {vow:Promise}
         */
        sendRequest: function (method, route, routeParameters, body) {
            var url = router.generate(route, routeParameters),
                deferred = Vow.defer(),
                _this = this;
            console.log(route, routeParameters, url);
            request({
                url: url,
                method: method,
                headers: this._getRequestHeaders(route),
                body: typeof body === 'object' ? JSON.stringify(body) : body
            }, function (err, res, body) {
                var output = {
                    error: err ? err.message : '',
                    body: _this._processBody(res, body)
                };
                if (res) {
                    output.response = {
                        statusCode: res.statusCode,
                        statusText: res.statusText
                    };
                }
                if (err) {
                    console.log(err);
                }
                if (res && (res.statusCode < 200 || res.statusCode > 299)) {
                    if (!output.error) {
                        output.error = output.body;
                    }
                    console.log(output.error);
                }
                deferred.resolve(output);
            });
            return deferred.promise();
        },

        /**
         * @param {String} route
         * @returns {Object}
         * @protected
         */
        _getRequestHeaders: function (route) {
            return {
                'Accept': 'application/json',
                'Content-type': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alve'
            };
        },

        /**
         * @param {OutgoingMessage} res
         * @param {String} body
         * @returns {String|Object}
         * @private
         */
        _processBody: function (res, body) {
            if (res && /json/.test(res.headers['content-type'])) {
                return JSON.parse(body);
            }
            return body;
        }

    }));

});

