/**@module i-page*/
modules.define('i-page', [
    'i-bem__dom', 'BEMHTML', 'BEMTREE', 'app-api-requester'
], function (provide, BEMDOM, BEMHTML, BEMTREE, appApiRequester, page) {
    "use strict";

    /**
     * @class IPage
     * @extends BEM.DOM
     * @exports
     */
    var IPage = BEMDOM.decl(this.name, page.proto, page.static).decl(/**@lends IPage*/{

        /**
         * @param {String} blockName
         * @param {Object} BEMJSON
         * @param {ApiRequester} [apiRequester]
         * @returns {vow:Promise}
         * @protected
         */
        _replace: function (blockName, BEMJSON, apiRequester) {
            return BEMTREE.apply(BEMJSON, apiRequester || appApiRequester).then(function (BEMJSON) {
                IPage.replace(this.findBlockInside(blockName).domElem, BEMHTML.apply(BEMJSON));
            }, this);
        }

    });
    provide(IPage);

});
