modules.define('app-kernel', [
    'i-bem__dom', 'history', 'app-api-requester'
], function (provide, BEMDOM, History, appApiRequester, appKernelDecl) {
    "use strict";

    provide(BEMDOM.decl(this.name, appKernelDecl).decl({

        onSetMod: {
            js: {
                inited: function () {
                    this.__base();
                    this._cacheCurrentPage(this.params.currentPage);
                    this._history = new History();
                }
            }
        },

        _cacheCurrentPage: function (pageName) {
            this._currentPage = this.findBlockInside(pageName);
            this._currentPageName = pageName;
        },

        _isPartialUpdateAvailable: function (Page) {
            return this._currentPageName === Page.getName() && typeof this._currentPage.update === 'function';
        },

        _processPage: function (Page, data) {
            //abort all app requests on page change
            appApiRequester.abort();
            if (this._isPartialUpdateAvailable(Page)) {
                return this._currentPage.update(data);
            } else {
                return this.__base(Page, data);
            }
        },

        _onPageProcessSuccess: function (data) {
            //when request comes from window popstate event, url already updated
            if (!data.request.isUrlUpdated) {
                this._history.pushState(null, '', data.request.url);
            }
        },

        _writeResponse: function (html, data, Page) {
            BEMDOM.replace(this._currentPage.domElem, html);
            this._cacheCurrentPage(Page.getName());
            document.title = Page.getTitle();
        }
    }));
});
