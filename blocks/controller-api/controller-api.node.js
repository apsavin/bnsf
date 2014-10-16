/**@module controller-api*/
modules.define('controller-api', [
    'i-controller', 'vow'
], function (provide, IController, Vow) {
    "use strict";

    /**
     * @class ControllerApi
     * @extends IController
     */
    provide(IController.decl(/**@lends ControllerApi.prototype*/{

        /**
         * @param {NodeRequestData} data
         */
        processRequest: function (data) {
            var method = data.request.method,
                requestParameters = data.route.parameters,
                bodies = (data.request.body ? data.request.body.bodies : []) || [],
                routes = requestParameters['r[]'],
                routesParameters = requestParameters['rP[]'] || [],
                route = requestParameters['r'],
                routeParameters = requestParameters['rP'],
                response = data.response,
                apiRequester = data.apiRequester;

            if (!routes) {
                if (!route) {
                    this._sendJSON(response, {
                        error: 'no requests'
                    });
                    return;
                } else {
                    routes = route;
                    routesParameters = routeParameters;
                    bodies = [data.request];
                }
            }

            routes = Array.isArray(routes) ? routes : [routes];
            routesParameters = Array.isArray(routesParameters) ? routesParameters : [routesParameters];

            var promises = [],
                parameters,
                body;
            try {
                for (var i = 0, l = routes.length; i < l; i++) {
                    parameters = JSON.parse(routesParameters[i]);
                    body = bodies[i] === 'null' ? undefined : bodies[i];
                    promises.push(apiRequester.sendRequest(method, routes[i], parameters, body));
                }
            } catch (e) {
                this._sendJSON(response, {
                    error: e.message
                });
                return;
            }

            Vow.allResolved(promises).then(function (promises) {
                this._sendJSON(response, promises.map(function (promise) {
                    return promise.valueOf();
                }));
            }, this);
        }
    }, {

        _route: 'api'

    }));
});
