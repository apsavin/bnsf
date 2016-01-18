/**@module api-requester*/
modules.define('api-requester', [
    'api-request', 'app-logger', 'objects'
], function (provide, ApiRequest, logger, objects, ApiRequester) {
    "use strict";

    var request = require('request'),
        URL = require('url'),
        Readable = require('stream').Readable,
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
         * @param {string} host
         * @returns {{host: string, cookies: Array.<string>}}
         * @protected
         */
        _getCookieStorageForHost: function (host) {
            var cookieStorage = this.params.cookieStorage;
            var cookiesForHosts = cookieStorage.cookies = cookieStorage.cookies || [],
                cookiesForHost;

            for (var i = 0; i < cookiesForHosts.length; i++) {
                cookiesForHost = cookiesForHosts[i];
                if (cookiesForHost.host === host) {
                    return cookiesForHost;
                }
            }
            cookiesForHost = {
                host: host,
                cookies: []
            };
            cookiesForHosts.push(cookiesForHost);
            return cookiesForHost;
        },

        /**
         * @param {String} method
         * @param {String} [route]
         * @param {?Object} [routeParameters]
         * @param {String|Object|Readable} [body]
         * @returns {ApiRequest}
         */
        sendRequest: function (method, route, routeParameters, body) {
            var url = this.params.router.generate(route, routeParameters),
                apiRequest = new ApiRequest(),
                parsedUrl = URL.parse(url),
                _this = this,
                cookieStorage = this._getCookieStorageForHost(parsedUrl.host);

            var jar = request.jar();
            if (cookieStorage.cookies.length) {
                cookieStorage.cookies.forEach(function (cookie) {
                    jar.setCookie(cookie, url);
                });
            }

            var requestCallback = function (err, res, body) {
                var parsedBody;

                try {
                    parsedBody = _this._processBody(res, body);
                } catch (e) {
                    logger.error('API response on ' + method.toUpperCase() + ' ' + url + ' can not be parsed');
                    logger.error('API response body:');
                    logger.error(body);
                    apiRequest.reject(e);
                    return;
                }

                var output = {
                    error: err ? err.message : '',
                    body: parsedBody
                };
                if (res) {
                    cookieStorage.cookies = jar.getCookies(url).map(function (cookie) {
                        return cookie.toString();
                    });
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
                if (err) {
                    logger.error('API request ' + method.toUpperCase() + ' ' + url + ' error:');
                    logger.error(err);
                    apiRequest.reject(output);
                } else if (badStatus) {
                    logger.warn('API request ' + method.toUpperCase() + ' ' + url + ' has status ' + res.statusCode);
                    logger.warn(output.error);
                    apiRequest.reject(output);
                } else {
                    apiRequest.resolve(output);
                }
            };

            var req;
            if (body && body instanceof Readable) {
                req = body.pipe(request({
                    url: url,
                    method: method,
                    jar: jar
                }, requestCallback));
            } else {
                var preparedBody = typeof body === 'object' ? JSON.stringify(body) : body;
                req = request({
                    url: url,
                    method: method,
                    headers: this._getRequestHeaders(route),
                    body: preparedBody,
                    gzip: true,
                    jar: jar
                }, requestCallback);
            }
            apiRequest.setRequest(req);
            return apiRequest;
        },

        /**
         * @param {String} route
         * @returns {Object}
         * @protected
         */
        _getRequestHeaders: function (route) {
            return {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Connection': 'keep-alive'
            };
        },

        /**
         * @param {OutgoingMessage} res
         * @param {String} body
         * @returns {String|Object}
         * @throws {Error} if JSON is malformed
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
