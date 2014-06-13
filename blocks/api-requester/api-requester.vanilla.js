modules.define('api-requester', ['i-bem'], function (provide, BEM) {
    "use strict";

    provide(BEM.decl(this.name, {

        get: function (route, routeParameters) {
            return this.sendRequest('get', route, routeParameters);
        },

        post: function (route, routeParameters, body) {
            return this.sendRequest('post', route, routeParameters, body);
        },

        put: function (route, routeParameters, body) {
            return this.sendRequest('put', route, routeParameters, body);
        },

        patch: function (route, routeParameters, body) {
            return this.sendRequest('patch', route, routeParameters, body);
        },

        del: function (route, routeParameters) {
            return this.sendRequest('delete', route, routeParameters);
        },

        sendRequest: function (method, route, routeParameters, body) {

        }

    }));

});
