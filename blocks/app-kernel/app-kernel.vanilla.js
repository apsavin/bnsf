/**@module app-kernel*/
modules.define('app-kernel', [
    'request-listener', 'app-router-base', 'BEMTREE', 'BEMHTML', 'pages'
], function (provide, RequestListener, appRouterBase, BEMTREE, BEMHTML, pages) {
    "use strict";

    /**
     * @class AppKernel
     * @exports
     */
    provide(/**@lends AppKernel.prototype*/{

        onSetMod: {
            js: {
                /**
                 * @constructs
                 */
                inited: function () {
                    this._initPages(function () {
                        this._initRequestListener();
                    });
                }
            }
        },

        /**
         * @returns {Array.<String>}
         * @private
         */
        _getPagesNames: function () {
            return pages;
        },

        /**
         * @param {Function} callback
         * @private
         */
        _initPages: function (callback) {
            var pages = this._getPagesNames();
            modules.require(pages, function () {
                this._pages = Array.prototype.slice.call(arguments).reduce(function (pages, Page) {
                    pages[Page.getRoute()] = Page;
                    return pages;
                }, {});
                callback.call(this);
            }.bind(this));
        },

        /**
         * @private
         */
        _initRequestListener: function () {
            this._requestListener = new RequestListener(null, {
                port: 3000
            });
            this._requestListener.on('request', this._onRequest, this);
        },

        /**
         * @param request
         * @returns {?Route}
         * @private
         */
        _getRoute: function (request) {
            return appRouterBase.match({
                path: request.url,
                method: request.method
            });
        },

        /**
         * @param {Event} e
         * @param {Object} data
         * @listens RequestListener#request
         * @private
         */
        _onRequest: function (e, data) {
            var route = this._getRoute(data.request);

            if (!route) {
                console.log('Route for request ', data.request.url, ' not found');
                return;
            }

            data.route = route;

            var controller = this._getController(route);
            if (controller) {
                this._processController(controller, data);
                return;
            }

            var Page = this._pages[route.id];

            if (!Page) {
                console.log('Page for route ', route.id, ' not found');
                return;
            }

            this._processPage(Page, data).then(function () {
                this._onPageProcessSuccess(data);
            }, this._onPageProcessError, this);
        },

        /**
         * @param {Object} data
         * @protected
         */
        _onPageProcessSuccess: function (data) {

        },

        /**
         * @param {Error} e
         * @protected
         */
        _onPageProcessError: function (e) {
            throw e;
        },

        /**
         * @param {Function} Page
         * @param {Object} data
         * @returns {vow:Promise}
         * @private
         */
        _processPage: function (Page, data) {
            return BEMTREE.apply(this._getBEMJSON(Page, data)).then(function (bemjson) {
                this._writeResponse(BEMHTML.apply(bemjson), data, Page);
            }, this);
        },

        /**
         * @param {Route} route
         * @returns {boolean}
         * @protected
         */
        _getController: function (route) {
            return false;
        },

        /**
         * @param {IController} controller
         * @param {Object} data
         * @protected
         */
        _processController: function (controller, data) {

        },

        /**
         * @param {String} html
         * @param {Object} data
         * @param {Function} Page
         * @protected
         */
        _writeResponse: function (html, data, Page) {

        },

        /**
         * @param {Function} Page
         * @param {Object} data
         * @returns {Object}
         * @protected
         */
        _getBEMJSON: function (Page, data) {
            return this._getPageContentBEMJSON(Page, data)
        },

        /**
         * @param {Function} Page
         * @param {Object} data
         * @returns {Object}
         * @protected
         */
        _getPageContentBEMJSON: function (Page, data) {
            return {
                block: Page.getName(),
                js: true,
                data: data
            };
        }
    });
});
