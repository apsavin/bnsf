/**@module app-kernel*/
modules.define('app-kernel', [
    'request-listener', 'app-router-base', 'BEMTREE', 'BEMHTML', 'pages', 'app-logger', 'vow'
], function (provide, RequestListener, appRouterBase, BEMTREE, BEMHTML, pages, logger, Vow) {
    "use strict";

    /**
     * @typedef {Object} RequestData
     * @property {{url: String, method: String, headers: {host: String}} request
     * @property {Route} route
     * @property {ApiRequester} apiRequester
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
                page403: 'page-403',
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
            this._processRequest(this._fillRequestData(data));
        },

        /**
         * @param {RequestData} data
         * @protected
         */
        _processRequest: function (data) {
            this._processPage(data.route.id, data);
        },

        /**
         * @param {RequestData} data
         * @returns {RequestData}
         * @protected
         */
        _fillRequestData: function (data) {
            var route = data.route || this._getRoute(data.request);

            if (!route) {
                logger.info('Route for request ', data.request.url, ' not found');
                route = { id: this.params.page404 };
            }

            data.route = route;
            return data;
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
            var statusCode = e.response ? e.response.statusCode : undefined;
            if (!this._handleWrongStatusError(statusCode, data)) {
                if (e.redirect) {
                    this._redirect(e.path, data);
                } else {
                    this._handlePageError(data);
                }
            }
        },

        /**
         * @param {number} statusCode
         * @param {RequestData} data
         * @returns {boolean} isHandled
         * @protected
         */
        _handleWrongStatusError: function (statusCode, data) {
            switch (statusCode) {
                case 404:
                    this._handlePage404Error(data);
                    return true;
                case 403:
                    this._handlePage403Error(data);
                    return true;
                default:
                    return false;
            }
        },

        /**
         * @param {String} pageName
         * @param {RequestData} data
         * @param {String} level 'error' or 'info'
         * @private
         */
        _redirectWithError: function (pageName, data, level) {
            var e = data.error,
                request = data.request;
            this._processPage(pageName, data);
            logger[level]('Error process page', request.url, request.method, level === 'error' && e.stack ? e.stack : e);
        },

        /**
         * @param {RequestData} data
         * @protected
         */
        _handlePage404Error: function (data) {
            this._redirectWithError(this.params.page404, data, 'info');
        },

        /**
         * @param {RequestData} data
         * @protected
         */
        _handlePage403Error: function (data) {
            this._redirectWithError(this.params.page403, data, 'info');
        },

        /**
         * @param {RequestData} data
         * @protected
         */
        _handlePageError: function (data) {
            this._redirectWithError(this.params.page500, data, 'error');
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
                logger.error(errorMessage, data.request.url);
                logger.error('Is "' + page + '" in the bemdecl.js file?');
                data.error = new Error(errorMessage);
                if (this._pages[this.params.page404]) {
                    this._handlePage404Error(data);
                } else if (this._pages[this.params.page500]) {
                    this._handlePageError(data);
                } else {
                    throw data.error;
                }
                return;
            }

            logger.info('Start process page', page);
            var promise;
            try {
                promise = BEMTREE.apply(this._getBEMJSON(Page, data), data)
                    .then(function (bemjson) {
                        this._writeResponse(BEMHTML.apply(bemjson), data, Page);
                        return data;
                    }, this);
            } catch (e) {
                promise = Vow.reject(e);
            }
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
         * @param {String} html
         * @param {RequestData} data
         * @param {Function} Page
         * @protected
         */
        _writeResponse: function (html, data, Page) {

        },

        /**
         * @param {String} url
         * @param {RequestData} data
         * @protected
         */
        _redirect: function (url, data) {
        },

        /**
         * @param {Function} Page
         * @param {RequestData} data
         * @returns {Object}
         * @protected
         */
        _getBEMJSON: function (Page, data) {
            return this._getPageBEMJSON(Page, data);
        },

        /**
         * @param {Function} Page
         * @param {RequestData} data
         * @returns {Object}
         * @protected
         */
        _getPageBEMJSON: function (Page, data) {
            return {
                block: 'page',
                title: this._getTitleBEMJSON(Page),
                content: this._getPageContentBEMJSON(Page, data)
            };
        },

        /**
         * @param {Function} Page
         * @returns {object}
         * @protected
         */
        _getTitleBEMJSON: function (Page) {
            return {
                block: Page.getName(),
                elem: 'title',
                tag: ''
            };
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
                js: true
            };
        }
    });
});
