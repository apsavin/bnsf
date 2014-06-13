modules.define('app-kernel', ['i-bem', 'controllers'], function (provide, BEM, controllers, appDecl) {
    "use strict";

    provide(BEM.decl(this.name, appDecl).decl({

        onSetMod: {
            js: {
                inited: function () {
                    this._initControllers(this.__base);
                }
            }
        },

        _getControllersNames: function () {
            return controllers;
        },

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

        _writeResponse: function (html, data) {
            data.response.end(html);
        },

        _getBEMJSON: function (Page, data) {
            return this._getPageBEMJSON(Page, data)
        },

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
                content: this._getPageContentBEMJSON(Page, data)
            };
        },

        /**
         * @param route
         * @private
         */
        _getController: function (route) {
            return this._controllers[route.id] || false;
        },

        _processController: function (controller, data) {
            controller.processRequest(data);
        }
    }));
});
