/**@module app-kernel*/
modules.define('app-kernel', [
    'request-listener', 'app-router-base', 'BEMTREE', 'BEMHTML', 'pages', 'app-logger'
], function (provide, RequestListener, appRouterBase, BEMTREE, BEMHTML, pages, logger) {
    "use strict";

    /**
     * @typedef {Object} RequestData
     * @property {{url: String, method: String}} request
     * @property {Route} route
     * @property {{error: String, handled: ?Boolean, response: [{statusCode: Number, statusText: String}]}} error
     */

    /**
     * @class AppKernel
     * @exports
     */
    provide(/**@lends AppKernel.prototype*/{

        getDefaultParams: function () {
            return {
                page404: 'page-404',
                page500: 'page-500'
            };
        },

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
         * @returns {{}}
         * @protected
         */
        _getRequestListenerParams: function () {
            return {};
        },

        /**
         * @private
         */
        _initRequestListener: function () {
            this._requestListener = new RequestListener(null, this._getRequestListenerParams());
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
            var route = data.route || this._getRoute(data.request);

            if (!route) {
                logger.info('Route for request ', data.request.url, ' not found');
                route = {id: this.params.page404};
            }

            data.route = route;

            var controller = this._getController(route);
            if (controller) {
                this._processController(controller, data);
                return;
            }

            this._processPage(route.id, data);
        },

        /**
         * @param {RequestData} data
         * @protected
         */
        _onPageProcessSuccess: function (data) {
        },

        /**
         * @param {RequestData} data
         * @protected
         */
        _onPageProcessError: function (data) {
            var e = data.error;
            if (e.handled) {
                logger.error(data);
                throw new Error(data);
            }
            e.handled = true;
            if (e.response && e.response.statusCode === 404) {
                this._processPage(this.params.page404, data);
                logger.info('Error process page', data.request.url, data.request.method, e);
            } else {
                this._processPage(this.params.page500, data);
                logger.error('Error process page', data.request.url, data.request.method, e);
            }
        },

        /**
         * @param {String} page
         * @param {RequestData} data
         * @returns {vow:Promise}
         * @protected
         */
        _processPage: function (page, data) {
            var Page = this._pages[page];

            if (!Page) {
                var errorMessage = 'Page "' + page + '" not found';
                logger.error(errorMessage);
                throw new Error(errorMessage);
            }

            logger.info('Start process page', page);
            var promise = BEMTREE.apply(this._getBEMJSON(Page, data)).then(function (bemjson) {
                this._writeResponse(BEMHTML.apply(bemjson), data, Page);
                return data;
            }, this);
            return this._postProcessPage(promise, data);
        },

        /**
         * @param {vow:Promise} promise
         * @param {RequestData} data
         * @returns {vow:Promise}
         * @protected
         */
        _postProcessPage: function (promise, data) {
            return promise.then(function () {
                return this._onPageProcessSuccess(data);
            }, function (e) {
                data.error = e;
                return this._onPageProcessError(data);
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
         * @param {RequestData} data
         * @protected
         */
        _processController: function (controller, data) {

        },

        /**
         * @param {String} html
         * @param {RequestData} data
         * @param {Function} Page
         * @protected
         */
        _writeResponse: function (html, data, Page) {

        },

        /**
         * @param {Function} Page
         * @param {RequestData} data
         * @returns {Object}
         * @protected
         */
        _getBEMJSON: function (Page, data) {
            return this._getPageContentBEMJSON(Page, data);
        },

        /**
         * @param {Function} Page
         * @param {RequestData} data
         * @returns {Object}
         * @protected
         */
        _getPageContentBEMJSON: function (Page, data) {
            return {
                block: Page.getName(),
                js: true,
                request: data.request,
                route: data.route
            };
        }
    });
});
