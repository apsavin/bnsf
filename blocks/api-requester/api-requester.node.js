/**@module api-requester*/
modules.define('api-requester', [
    'api-request', 'app-logger', 'objects'
], function (provide, ApiRequest, logger, objects, ApiRequester) {
    "use strict";

    var request = require('request'),
        Readable = require('stream').Readable;

    /**
     * @class ApiRequester
     * @extends BEM
     * @exports
     */
    provide(ApiRequester.decl(/**@lends ApiRequester.prototype*/{

        /**
         * @type function
         * @protected
         */
        _request: request,

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
                _this = this;

            apiRequest.setRequest(this._sendRequest({
                route: route,
                url: url,
                method: method,
                body: body,
                jar: request.jar(this.params.cookieStorage)
            }, function (err, res, body) {
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
                    output.response = {
                        statusCode: res.statusCode,
                        statusText: res.statusText
                    };
                }
                var badStatus = res && !ApiRequester.isResponseStatusSuccess(res.statusCode);
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
            }));
            return apiRequest;
        },

        /**
         * @param {object} options
         * @param {string} options.route
         * @param {string} options.url
         * @param {string} options.method
         * @param {string|object} options.body
         * @param {CookieJar} options.jar
         * @param {function} requestCallback
         * @returns {object}
         * @protected
         */
        _sendRequest: function (options, requestCallback) {
            var body = options.body,
                requestParameters = {
                    url: options.url,
                    method: options.method,
                    jar: options.jar
                };
            if (body && body instanceof Readable) {
                return body.pipe(this._request(requestParameters, requestCallback));
            }

            var preparedBody = typeof body === 'object' ? JSON.stringify(body) : body;
            return this._request(objects.extend(requestParameters, {
                headers: this._getRequestHeaders(options.route),
                body: preparedBody,
                gzip: true
            }), requestCallback);
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
