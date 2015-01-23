/**@module i-page*/
modules.define('i-page', [
    'i-bem__dom', 'BEMHTML', 'BEMTREE', 'vow'
], function (provide, BEMDOM, BEMHTML, BEMTREE, Vow, page) {
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
         * if this method returns promise then partial update is available
         * @param {RequestData} data
         * @returns {?Promise}
         * @method
         * @example
         * update: function (data) {
         *      return this._update('some-block', data);
         * }
         */
        update: function (data) {
            var blocksForUpdate = this.params.update;
            if (!blocksForUpdate) {
                return null;
            }
            return this._update.call(this, blocksForUpdate, data);
        },

        /**
         * you can use several blockNames, data is the last parameter
         * @param {String|Array} blockName
         * @param {RequestData} data
         * @returns {Promise}
         * @protected
         */
        _update: function (blockName, data) {
            var blocks = Array.isArray(blockName) ? blockName : [blockName];
            return Vow.all(blocks.map(function (blockName) {
                return BEMTREE.apply({ block: blockName }, data).then(function (BEMJSON) {
                    this.findBlocksInside(blockName).forEach(replaceBlock, BEMHTML.apply(BEMJSON));
                }, this);
            }, this));
        }

    });
    provide(IPage);
});
