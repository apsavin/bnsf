/**@module app-kernel*/
modules.define('app-kernel', ['i-bem', 'controllers'], function (provide, BEM, controllers, appDecl) {
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
            return {
                requestListenerPort: 3000,
                staticHost: 'localhost:8080'
            };
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
         * @param {Function} Page
         * @param {NodeRequestData} data
         * @returns {Object}
         * @protected
         */
        _getBEMJSON: function (Page, data) {
            return this._getPageBEMJSON(Page, data);
        },

        /**
         * @param {Function} Page
         * @param {NodeRequestData} data
         * @returns {Object}
         * @protected
         */
        _getPageBEMJSON: function (Page, data) {
            return {
                block: 'page',
                title: Page.getTitle(),
                mix: {
                    block: 'app-kernel',
                    js: {
                        currentPage: Page.getName()
                    }
                },
                scripts: [
                    {elem: 'js', url: '//' + this.params.staticHost + '/desktop.bundles/index/_index.js'}
                ],
                styles: [
                    {elem: 'css', url: '//' + this.params.staticHost + '/desktop.bundles/index/_index.css'}
                ],
                content: this._getPageContentBEMJSON(Page, data)
            };
        },

        /**
         * @param {Route} route
         * @protected
         */
        _getController: function (route) {
            return this._controllers[route.id] || false;
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
