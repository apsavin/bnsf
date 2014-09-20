/**@module api-requester*/
modules.define('api-requester', [
    'vow', 'app-logger', 'objects'
], function (provide, Vow, logger, objects, ApiRequester) {
    "use strict";

    var request = require('request'),
        URL = require('url'),
        defaultCookieStorage = {};

    /**
     * @class ApiRequester
     * @extends BEM
     * @exports
     */
    provide(ApiRequester.decl(/**@lends ApiRequester.prototype*/{

        getDefaultParams: function () {
            return objects.extend({
                cookieStorage: defaultCookieStorage
            }, this.__base());
        },

        /**
         * @param {String} method
         * @param {String} [route]
         * @param {Object} [routeParameters]
         * @param {String|Object} [body]
         * @returns {vow:Promise}
         */
        sendRequest: function (method, route, routeParameters, body) {
            var url = this.params.router.generate(route, routeParameters),
                deferred = Vow.defer(),
                parsedUrl = URL.parse(url),
                _this = this,
                cookieStorage = this.params.cookieStorage,
                cookieId = parsedUrl.protocol + parsedUrl.host;

            cookieStorage.cookies = cookieStorage.cookies || {};

            var jar = request.jar();
            if (cookieStorage.cookies[cookieId]) {
                jar.setCookie(cookieStorage.cookies[cookieId], url);
            }

            request({
                url: url,
                method: method,
                headers: this._getRequestHeaders(route),
                body: typeof body === 'object' ? JSON.stringify(body) : body,
                jar: jar
            }, function (err, res, body) {
                var output = {
                    error: err ? err.message : '',
                    body: _this._processBody(res, body)
                };
                if (res) {
                    cookieStorage.cookies[cookieId] = jar.getCookieString(url);
                    output.response = {
                        statusCode: res.statusCode,
                        statusText: res.statusText
                    };
                }
                var badStatus = res && (res.statusCode < 200 || res.statusCode > 299);
                if (badStatus) {
                    if (!output.error) {
                        output.error = output.body;
                    }
                }
                if (err || badStatus) {
                    logger.warn(output.error);
                    deferred.reject(output);
                } else {
                    deferred.resolve(output);
                }
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
                'Connection': 'keep-alive'
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
