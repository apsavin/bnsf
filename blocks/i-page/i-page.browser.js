/**@module i-page*/
modules.define('i-page', [
    'i-bem__dom', 'BEMHTML', 'BEMTREE', 'vow'
], function (provide, BEMDOM, BEMHTML, BEMTREE, Vow, page) {
    "use strict";

    /**
     * @param {BEMDOM} block
     * @this {string} html
     */
    var replaceBlock = function (block) {
        IPage.replace(block.domElem, this);
    };

    /**
     * @param {object} BEMJSON
     * @this {Array} of BEMDOM instances
     * @returns {Array}
     */
    var replaceBlocks = function (BEMJSON) {
        return this.forEach(replaceBlock, BEMHTML.apply(BEMJSON));
    };

    /**
     * @class IPage
     * @extends BEMDOM
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
         * runs when user leaves the page
         * you can show a page-related spinner here
         * @public
         */
        leave: function () {
        },

        /**
         * @param {String|Array} blockName
         * @param {RequestData} data
         * @returns {Promise}
         * @protected
         */
        _update: function (blockName, data) {
            var blocksNames = Array.isArray(blockName) ? blockName : [blockName];
            return Vow.all(blocksNames.map(function (blockName) {
                var blocks = this.findBlocksInside(blockName);
                if (!blocks.length) {
                    return Vow.resolve();
                }
                this._onPartUpdateStart(blocks, blockName);
                return BEMTREE.apply({ block: blockName }, data).then(replaceBlocks, blocks);
            }, this));
        },

        /**
         * @param {Array.<BEMDOM>} blocks
         * @param {string} name
         * @protected
         */
        _onPartUpdateStart: function (blocks, name) {
        }

    });
    provide(IPage);
});
