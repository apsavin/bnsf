/**@module api-requester*/
modules.define('api-requester', [
    'jquery', 'vow', 'functions__debounce'
], function (provide, $, Vow, debounce, ApiRequester) {
    "use strict";

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
                    this._sendDebouncedRequest = {};

                    /**
                     * @type {String}
                     * @private
                     */
                    this._apiPath = this.params.router.generate('api');

                    ['get', 'post', 'put', 'patch', 'delete'].forEach(function (method) {
                        this._requests[method] = [];
                        this._sendDebouncedRequest[method] = debounce(this._sendRequest.bind(this, method));
                    }, this);
                }
            }
        },

        /**
         * @param {String} method
         * @param {String} route
         * @param {Object} [routeParameters]
         * @param {String|Object} [body]
         * @returns {vow:Promise}
         */
        sendRequest: function (method, route, routeParameters, body) {
            method = method.toLowerCase();
            var deferred = Vow.defer();
            this._requests[method].push({
                data: {
                    route: route,
                    routeParameters: routeParameters,
                    body: body
                },
                deferred: deferred
            });
            this._sendDebouncedRequest[method]();
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
        _prepareUrl: function (method, requests) {
            var data = {
                r: requests.map(function (request) {
                    return request.data.route;
                }),
                rP: requests.map(function (request) {
                    return JSON.stringify(request.data.routeParameters || null);
                })
            };
            return this._apiPath + '?' + $.param(data);
        },

        /**
         * @param {String} method
         * @private
         */
        _sendRequest: function (method) {
            var requests = this._requests[method],
                activeXhrs = this._activeXhrs;
            this._requests[method] = [];
            this._activeXhrs.push($.ajax({
                url: this._prepareUrl(method, requests),
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
                            request.deferred.reject({
                                error: responses,
                                response: xhr
                            });
                        });
                    }
                },
                error: function (xhr, statusText, error) {
                    requests.forEach(function (request) {
                        request.deferred.reject({
                            error: error,
                            response: xhr
                        });
                    });
                },
                complete: function (xhr) {
                    activeXhrs = activeXhrs.filter(function (activeXhr) {
                        return xhr !== activeXhr;
                    });
                }
            }));
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
