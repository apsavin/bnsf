/**@module api-requester*/
modules.define('api-requester', [
    'jquery', 'functions__debounce', 'api-request'
], function (provide, $, debounce, ApiRequest, ApiRequester) {
    "use strict";

    /**
     * @param {ApiRequest} request
     * @returns {ApiRequest}
     */
    function isRequestNotAborted (request) {
        return !request.isAborted();
    }

    /**
     * @class ApiRequester
     * @extends BEM
     * @exports
     */
    provide(ApiRequester.decl(/**@lends ApiRequester.prototype*/{

        onSetMod: {
            js: {
                /**
                 * @constructs
                 */
                inited: function () {
                    this.__base();
                    /**
                     * @type {Object.<Array.<ApiRequest>>}
                     * @private
                     */
                    this._requests = {};
                    /**
                     * @type {Array.<XMLHttpRequest>}
                     * @private
                     */
                    this._activeXhrs = [];
                    /**
                     *
                     * @type {Object.<Function>}
                     * @private
                     */
                    this._sendDebouncedRequests = {};

                    this._onXhrComplete = this._onXhrComplete.bind(this);

                    /**
                     * @type {String}
                     * @private
                     */
                    this._apiPath = this.params.router.generate('api');

                    ['get', 'post', 'put', 'patch', 'delete'].forEach(function (method) {
                        this._requests[method] = [];
                        this._sendDebouncedRequests[method] = debounce(this._sendRequests.bind(this, method));
                    }, this);
                }
            }
        },

        /**
         * @param {String} method
         * @param {String} route
         * @param {?Object} [routeParameters]
         * @param {String|Object} [body]
         * @returns {ApiRequest}
         */
        sendRequest: function (method, route, routeParameters, body) {
            method = method.toLowerCase();
            if (body && !$.isPlainObject(body) && typeof body !== 'string') {
                return this._sendRequest(method, route, routeParameters, body);
            }
            var request = new ApiRequest({
                route: route,
                routeParameters: routeParameters,
                body: body
            });
            this._requests[method].push(request);
            this._sendDebouncedRequests[method]();
            return request;
        },

        /**
         * @param {String} method
         * @param {Array} requests
         * @returns {Object|undefined}
         * @private
         */
        _prepareData: function (method, requests) {
            var data;
            if (method === 'post' || method === 'put' || method === 'patch') {
                data = {
                    bodies: requests.map(function (request) {
                        return JSON.stringify(request.data.body || null);
                    })
                };
            }
            return data;
        },

        /**
         * @param {String} method
         * @param {Array} requests
         * @returns {string}
         * @private
         */
        _prepareUrls: function (method, requests) {
            var routes = requests.map(function (request) {
                    return request.data.route;
                }),
                routesParameters = requests.map(function (request) {
                    return JSON.stringify(request.data.routeParameters || null);
                });
            return this._prepareUrl(routes, routesParameters);
        },

        /**
         * @param {String|Array.<String>} route
         * @param {String|Array.<String>} routeParameters
         * @returns {string}
         * @private
         */
        _prepareUrl: function (route, routeParameters) {
            return this._apiPath + '?' + $.param({
                    r: route,
                    rP: routeParameters
                });
        },

        /**
         * @param {String} method
         * @param {String} route
         * @param {?Object} routeParameters
         * @param {FormData} body
         * @returns {ApiRequest}
         * @private
         */
        _sendRequest: function (method, route, routeParameters, body) {
            var apiRequest = new ApiRequest();
            var xhr = $.ajax({
                url: this._prepareUrl(route, JSON.stringify(routeParameters)),
                type: method,
                data: body,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.error) {
                        apiRequest.reject(response);
                    } else {
                        apiRequest.resolve(response);
                    }
                },
                error: function (xhr, statusText, error) {
                    apiRequest.reject(error, xhr);
                },
                complete: this._onXhrComplete
            });
            this._activeXhrs.push(xhr);
            apiRequest.setRequest(xhr);
            return apiRequest;
        },

        /**
         * @param {String} method
         * @private
         */
        _sendRequests: function (method) {
            var requests = this._requests[method].filter(isRequestNotAborted);
            this._requests[method] = [];
            if (!requests.length) {
                return;
            }
            var xhr = $.ajax({
                url: this._prepareUrls(method, requests),
                type: method,
                dataType: 'json',
                data: this._prepareData(method, requests),
                success: function (responses, status, xhr) {
                    if (responses.forEach) {
                        responses.forEach(function (response, i) {
                            var request = requests[i];
                            if (response.error) {
                                request.reject(response);
                            } else {
                                request.resolve(response);
                            }
                        });
                    } else {
                        requests.forEach(function (request) {
                            request.reject(responses, xhr);
                        });
                    }
                },
                error: function (xhr, statusText, error) {
                    requests.forEach(function (request) {
                        request.reject(error, xhr);
                    });
                },
                complete: this._onXhrComplete
            });

            // we can `setRequest` only if we have exactly one `ApiRequest` instance
            // so `ApiRequest#abort` will really abort xhr
            if (requests.length === 1) {
                requests[0].setRequest(xhr);
            }
            this._activeXhrs.push(xhr);
        },

        /**
         * @param {XMLHttpRequest} xhr
         * @private
         */
        _onXhrComplete: function (xhr) {
            this._activeXhrs = this._activeXhrs.filter(function (activeXhr) {
                return xhr !== activeXhr;
            });
        },

        /**
         * Aborts all active XHRs
         * @public
         */
        abort: function () {
            while (this._activeXhrs.length) {
                this._activeXhrs.pop().abort();
            }
        }
    }));
});
