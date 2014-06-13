modules.define('api-requester', [
    'jquery', 'app-router-base', 'vow', 'functions__debounce'
], function (provide, $, router, Vow, debounce, ApiRequester) {
    "use strict";

    var apiPath = router.generate('api');

    provide(ApiRequester.decl({

        onSetMod: {
            js: {
                inited: function () {
                    this._requests = {};
                    this._activeXhrs = [];
                    this._sendDebouncedRequest = {};

                    ['get', 'post', 'put', 'patch', 'delete'].forEach(function (method) {
                        this._requests[method] = [];
                        this._sendDebouncedRequest[method] = debounce(this._sendRequest.bind(this, method));
                    }, this);
                }
            }
        },

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

        _prepareUrl: function (method, requests) {
            var data = {
                r: requests.map(function (request) {
                    return request.data.route;
                }),
                rP: requests.map(function (request) {
                    return JSON.stringify(request.data.routeParameters || null);
                })
            };
            return apiPath + '?' + $.param(data);
        },

        _sendRequest: function (method) {
            var requests = this._requests[method],
                activeXhrs = this._activeXhrs;
            this._requests[method] = [];
            this._activeXhrs.push($.ajax({
                url: this._prepareUrl(method, requests),
                type: method,
                dataType: 'json',
                data: this._prepareData(method, requests),
                success: function (responses) {
                    responses.forEach(function (response, i) {
                        var deferred = requests[i].deferred;
                        if (response.error) {
                            deferred.reject(response);
                        } else {
                            deferred.resolve(response);
                        }
                    });
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

        abort: function () {
            while (this._activeXhrs.length) {
                this._activeXhrs.pop().abort();
            }
        }
    }));
});
