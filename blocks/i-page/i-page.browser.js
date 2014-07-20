/**@module i-page*/
modules.define('i-page', ['i-bem__dom', 'BEMHTML', 'BEMTREE'], function (provide, BEMDOM, BEMHTML, BEMTREE, page) {
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
         * @returns {vow:Promise}
         * @protected
         */
        _replace: function (blockName, BEMJSON) {
            return BEMTREE.apply(BEMJSON).then(function (BEMJSON) {
                IPage.replace(this.findBlockInside(blockName).domElem, BEMHTML.apply(BEMJSON));
            }, this);
        }

    });
    provide(IPage);

});
