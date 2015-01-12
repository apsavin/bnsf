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
         * if this method is defined then partial update is available
         * @param {RequestData} data
         * @returns {Promise}
         * @method
         * @example
         * update: function (data) {
         *      return this._replace('some-block', {
         *          block: 'some-block',
         *          param: data.route.parameters.param
         *      });
         * }
         */
        update: null,

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
