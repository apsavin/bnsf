/**@module i-page*/
modules.define('i-page', [
    'BEMHTML', 'BEMTREE', 'vow'
], function (provide, BEMHTML, BEMTREE, Vow, IPage) {
    "use strict";

    /**
     * @param {BEM.DOM} block
     * @this {string} html
     */
    var replaceBlock = function (block) {
        IPage.replace(block.domElem, this);
    };

    provide(IPage.decl(/**@lends IPage*/{

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
                    //todo: figure out why phantom don't understand array.forEach(fn, context) here
                    this.findBlocksInside(blockName).forEach(replaceBlock.bind(BEMHTML.apply(BEMJSON)));
                }, this);
            }, this));
        }

    }));
});
