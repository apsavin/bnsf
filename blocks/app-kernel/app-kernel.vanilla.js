modules.define('app-kernel', [
    'request-listener', 'app-router-base', 'BEMTREE', 'BEMHTML', 'pages'
], function (provide, RequestListener, appRouterBase, BEMTREE, BEMHTML, pages) {
    "use strict";

    provide({

        onSetMod: {
            js: {
                inited: function () {
                    this._initPages(function () {
                        this._initRequestListener();
                    });
                }
            }
        },

        _getPagesNames: function () {
            return pages;
        },

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

        _initRequestListener: function () {
            this._requestListener = new RequestListener(null, {
                port: 3000
            });
            this._requestListener.on('request', this._onRequest, this);
        },

        _getRoute: function (request) {
            return appRouterBase.match({
                path: request.url,
                method: request.method
            });
        },

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

        _onPageProcessSuccess: function (data) {

        },

        _onPageProcessError: function (e) {
            throw e;
        },

        _processPage: function (Page, data) {
            return BEMTREE.apply(this._getBEMJSON(Page, data)).then(function (bemjson) {
                this._writeResponse(BEMHTML.apply(bemjson), data, Page);
            }, this);
        },

        _getController: function (route) {
            return false;
        },

        _processController: function (controller, data) {

        },

        _writeResponse: function (html, data, Page) {

        },

        _getBEMJSON: function (Page, data) {
            return this._getPageContentBEMJSON(Page, data)
        },

        _getPageContentBEMJSON: function (Page, data) {
            return {
                block: Page.getName(),
                js: true,
                data: data
            };
        }
    });
});
