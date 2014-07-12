/**@module navigation*/
modules.define('navigation', [
    'i-bem', 'jquery', 'history', 'app-router-base'
], function (provide, BEM, $, History, router) {
    "use strict";

    /**
     * @class Navigation
     * @extends BEM
     * @exports
     */
    provide(BEM.decl(this.name, /**@lends Navigation.prototype*/{

        onSetMod: {
            js: {
                /**
                 * @constructs
                 * @this Navigation
                 */
                inited: function () {
                    this._initPopStateListener();
                    this._initHistory();
                }
            }
        },

        /**
         * @private
         */
        _initPopStateListener: function () {
            var _this = this;
            $(window).on('popstate', function () {
                _this.emit('request', {
                    request: {
                        url: location.pathname + location.search,
                        isUrlUpdated: true,
                        method: 'GET'
                    }
                });
            });
        },

        /**
         * @private
         */
        _initHistory: function () {
            /**
             * @type {History}
             * @private
             */
            this._history = new History();
        },

        /**
         * @param {String} route
         * @param {Object} [routeParameters]
         */
        navigate: function (route, routeParameters) {
            if (typeof route === 'string') {
                this.emit('request', {
                    request: {
                        url: router.generate(route, routeParameters),
                        method: 'GET'
                    },
                    route: {
                        id: route,
                        parameters: routeParameters
                    }
                });
                return;
            }
            //if route is not a string, then it's not really a route
            var data = route;
            //when request comes from window popstate event, url already updated
            if (!data.request.isUrlUpdated) {
                this._history.pushState(null, '', data.request.url);
            }
            this.emit('change:page', data);
        }
    }));
});

