/**@module i-page*/
modules.define('i-page', [
    'i-bem__dom', 'BEMHTML', 'BEMTREE'
], function (provide, BEMDOM, BEMHTML, BEMTREE, page) {
    "use strict";

    /**
     * @param {BEM.DOM} block
     * @this {string} html
     */
    var replaceBlock = function (block) {
        IPage.replace(block.domElem, this);
    };

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
         * @param {RequestData} data
         * @returns {Promise}
         * @protected
         */
        _update: function (blockName, data) {
            return BEMTREE.apply({ block: blockName }, data).then(function (BEMJSON) {
                this.findBlocksInside(blockName).forEach(replaceBlock, BEMHTML.apply(BEMJSON));
            }, this);
        }

    });
    provide(IPage);
});
