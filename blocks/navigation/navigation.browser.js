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
                    this._initHistory();
                }
            }
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
            this._history.on('popsensibleurlfragment', this._onPopSensibleUrlFragment, this);
        },

        /**
         * @param {Event} e
         * @param {{sensibleUrlFragment: string}} data
         * @private
         */
        _onPopSensibleUrlFragment: function (e, data) {
            this.emit('request', this._getRequestByHistoryEventData(data.sensibleUrlFragment));
        },

        /**
         * @param {string} url
         * @returns {{request: {url: *, isUrlUpdated: boolean, method: string}}}
         * @protected
         */
        _getRequestByHistoryEventData: function (url) {
            return {
                request: {
                    url: url,
                    isUrlUpdated: true,
                    method: 'GET'
                }
            };
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

