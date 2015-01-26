/**@module api-requester*/
modules.define('api-requester', [
    'jquery', 'vow', 'functions__debounce'
], function (provide, $, Vow, debounce, ApiRequester) {
    "use strict";

    /**
     * @param {Deferred} deferred
     * @param {*} error
     * @param {XMLHttpRequest} xhr
     */
    var rejectDeferred = function (deferred, error, xhr) {
        deferred.reject({
            error: error,
            response: {
                statusCode: xhr.status,
                statusText: xhr.statusText
            }
        });
    };

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
                     * @type {Object.<Array>}
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
         * @returns {vow:Promise}
         */
        sendRequest: function (method, route, routeParameters, body) {
            method = method.toLowerCase();
            if (body && !$.isPlainObject(body) && typeof body !== 'string') {
                return this._sendRequest(method, route, routeParameters, body);
            }
            var deferred = Vow.defer();
            this._requests[method].push({
                data: {
                    route: route,
                    routeParameters: routeParameters,
                    body: body
                },
                deferred: deferred
            });
            this._sendDebouncedRequests[method]();
            return deferred.promise();
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
         * @returns {vow:Promise}
         * @private
         */
        _sendRequest: function (method, route, routeParameters, body) {
            var deferred = Vow.defer();
            this._activeXhrs.push($.ajax({
                url: this._prepareUrl(route, JSON.stringify(routeParameters)),
                type: method,
                data: body,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.error) {
                        deferred.reject(response);
                    } else {
                        deferred.resolve(response);
                    }
                },
                error: function (xhr, statusText, error) {
                    rejectDeferred(deferred, error, xhr);
                },
                complete: this._onXhrComplete
            }));
            return deferred.promise();
        },

        /**
         * @param {String} method
         * @private
         */
        _sendRequests: function (method) {
            var requests = this._requests[method];
            this._requests[method] = [];
            this._activeXhrs.push($.ajax({
                url: this._prepareUrls(method, requests),
                type: method,
                dataType: 'json',
                data: this._prepareData(method, requests),
                success: function (responses, status, xhr) {
                    if (responses.forEach) {
                        responses.forEach(function (response, i) {
                            var deferred = requests[i].deferred;
                            if (response.error) {
                                deferred.reject(response);
                            } else {
                                deferred.resolve(response);
                            }
                        });
                    } else {
                        requests.forEach(function (request) {
                            rejectDeferred(request.deferred, responses, xhr);
                        });
                    }
                },
                error: function (xhr, statusText, error) {
                    requests.forEach(function (request) {
                        rejectDeferred(request.deferred, error, xhr);
                    });
                },
                complete: this._onXhrComplete
            }));
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
