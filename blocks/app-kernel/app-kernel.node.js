/**@module app-kernel*/
modules.define('app-kernel', ['i-bem', 'controllers'], function (provide, BEM, controllers, appDecl) {
    "use strict";

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
         * @param {Object} data
         * @protected
         */
        _writeResponse: function (html, data) {
            data.response.end(html);
        },

        /**
         * @param {Function} Page
         * @param {String} data
         * @returns {Object}
         * @protected
         */
        _getBEMJSON: function (Page, data) {
            return this._getPageBEMJSON(Page, data);
        },

        /**
         * @param {Function} Page
         * @param {String} data
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
                    {elem: 'js', url: '//localhost:8080/desktop.bundles/index/_index.js'}
                ],
                styles: [
                    {elem: 'css', url: '//localhost:8080/desktop.bundles/index/_index.css'}
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
         * @param {Object} data
         * @private
         */
        _processController: function (controller, data) {
            controller.processRequest(data);
        }
    }));
});
