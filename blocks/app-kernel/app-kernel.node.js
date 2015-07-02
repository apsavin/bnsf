/**@module app-kernel*/
modules.define('app-kernel', [
    'i-bem', 'controllers', 'app-api-router', 'api-requester', 'objects', 'app-kernel__config'
], function (provide, BEM, controllers, router, ApiRequester, objects, config, appDecl) {
    "use strict";

    /**
     * @typedef {RequestData} NodeRequestData
     * @property {IncomingMessage} request
     * @property {OutgoingMessage} response
     */

    /**
     * @class AppKernel
     * @extends BEM
     * @exports
     */
    provide(BEM.decl(this.name, appDecl).decl(/**@lends AppKernel.prototype*/{

        onSetMod: {
            js: {
                /**
                 * @constructs
                 */
                inited: function () {
                    this._initControllers(this.__base);
                }
            }
        },

        /**
         * @protected
         * @returns {{requestListenerPort: number}}
         */
        getDefaultParams: function () {
            return objects.extend({
                requestListenerPort: config.port,
                staticHost: config.staticHost
            }, this.__base());
        },

        /**
         * @returns {{}}
         * @protected
         */
        _getRequestListenerParams: function () {
            return {
                port: this.params.requestListenerPort
            };
        },

        /**
         * @returns {Array.<String>}
         * @private
         */
        _getControllersNames: function () {
            return controllers;
        },

        /**
         * @param {Function} callback
         * @private
         */
        _initControllers: function (callback) {
            var controllers = this._getControllersNames();
            modules.require(controllers, function () {
                this._controllers = Array.prototype.slice.call(arguments).reduce(function (controllers, Controller) {
                    controllers[Controller.getRoute()] = new Controller;
                    return controllers;
                }, {});
                callback.call(this);
            }.bind(this));
        },

        /**
         * @param {RequestData} data
         * @returns {NodeRequestData}
         * @protected
         */
        _fillRequestData: function (data) {
            data = this.__base(data);
            data.apiRequester = new ApiRequester(null, {
                router: router,
                cookieStorage: data.request.session
            });
            return data;
        },

        /**
         * @param {NodeRequestData} data
         * @protected
         */
        _processRequest: function (data) {
            var route = data.route,
                controller = this._getController(route);
            if (controller) {
                this._processController(controller, data);
                return;
            }
            this.__base(data);
        },

        /**
         * @param {String} html
         * @param {NodeRequestData} data
         * @protected
         */
        _writeResponse: function (html, data) {
            var response = data.response,
                statusCode = 200;
            if (data.error) {
                statusCode = 500;
                if (data.error.response && data.error.response.statusCode) {
                    statusCode = data.error.response.statusCode;
                }
            }
            response.writeHead(statusCode, {
                'Content-Length': Buffer.byteLength(html),
                'Content-Type': 'text/html'
            });
            response.end(html);
        },

        /**
         * @param {String} url
         * @param {NodeRequestData} data
         * @protected
         */
        _redirect: function (url, data) {
            var response = data.response;
            response.writeHead(302, {
                'Location': url
            });
            response.end();
        },

        /**
         * @param {Function} Page
         * @param {NodeRequestData} data
         * @returns {Object}
         * @protected
         */
        _getPageBEMJSON: function (Page, data) {
            return objects.extend(this.__base(Page, data), {
                mix: {
                    block: 'app-kernel',
                    js: {
                        currentPage: Page.getName()
                    }
                },
                scripts: [
                    { elem: 'js', url: '//' + this.params.staticHost + '/bundles/index/_index.js' }
                ],
                styles: [
                    { elem: 'css', url: '//' + this.params.staticHost + '/bundles/index/_index.css' }
                ]
            });
        },

        /**
         * @param {Route} route
         * @returns {?IController}
         * @protected
         */
        _getController: function (route) {
            return this._controllers[route.id];
        },

        /**
         * @param {IController} controller
         * @param {NodeRequestData} data
         * @private
         */
        _processController: function (controller, data) {
            controller.processRequest(data);
        }
    }));
});
