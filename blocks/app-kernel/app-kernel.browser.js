/**@module app-kernel*/
modules.define('app-kernel', [
    'i-bem__dom', 'app-api-requester', 'app-navigation'
], function (provide, BEMDOM, appApiRequester, navigation, appKernelDecl) {
    "use strict";

    /**
     * @class AppKernel
     * @extends BEM.DOM
     * @exports
     */
    provide(BEMDOM.decl(this.name, appKernelDecl).decl(/**@lends AppKernel.prototype*/{

        onSetMod: {
            js: {
                /**
                 * @constructs
                 */
                inited: function () {
                    this.__base();
                    this._cacheCurrentPage(this.params.currentPage);
                }
            }
        },

        /**
         * @param {String} pageName
         * @private
         */
        _cacheCurrentPage: function (pageName) {
            this._currentPage = this.findBlockInside(pageName);
            this._currentPageName = pageName;
        },

        /**
         * @param {Function} Page
         * @returns {boolean}
         * @private
         */
        _isPartialUpdateAvailable: function (Page) {
            return this._currentPageName === Page.getName() && typeof this._currentPage.update === 'function';
        },

        /**
         * @param {Function} Page
         * @param {Object} data
         * @returns {vow:Promise}
         * @protected
         */
        _processPage: function (Page, data) {
            //abort all app requests on page change
            appApiRequester.abort();
            if (this._isPartialUpdateAvailable(Page)) {
                return this._currentPage.update(data);
            } else {
                return this.__base(Page, data);
            }
        },

        /**
         * @param {Object} data
         * @protected
         */
        _onPageProcessSuccess: function (data) {
            navigation.navigate(data);
        },

        /**
         * @param {String} html
         * @param {Object} data
         * @param {Function} Page
         * @protected
         */
        _writeResponse: function (html, data, Page) {
            BEMDOM.replace(this._currentPage.domElem, html);
            this._cacheCurrentPage(Page.getName());
            document.title = Page.getTitle();
        }
    }));
});
