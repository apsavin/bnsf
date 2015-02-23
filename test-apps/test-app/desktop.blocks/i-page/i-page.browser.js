/**@module i-page*/
modules.define('i-page', [
    'i-bem__dom', 'BEMHTML', 'BEMTREE', 'vow', 'jquery'
], function (provide, BEMDOM, BEMHTML, BEMTREE, Vow, $, page) {
    "use strict";

    /**
     * @param {BEMDOM|jQuery} block
     * @this {string} html
     */
    var replaceBlock = function (block) {
        IPage.replace(block.domElem || block, this);
    };

    /**
     * @param {object} BEMJSON
     * @this {Array.<BEMDOM|jQuery>}
     * @returns {Array}
     */
    var replaceBlocks = function (BEMJSON) {
        //todo: figure out why phantom doesn't understand array.forEach(fn, context) here
        return this.forEach(replaceBlock.bind(BEMHTML.apply(BEMJSON)));
    };

    /**
     * @class IPage
     * @extends BEMDOM
     * @exports
     */
    var IPage = BEMDOM.decl(this.name, page.proto, page.static).decl(/**@lends IPage*/{

        /**
         * @param {string|{block: string|undefined, elem: string|undefined}|Array} partDecl
         * @param {RequestData} data
         * @returns {Promise}
         * @protected
         */
        _update: function (partDecl, data) {
            var partsDecls = Array.isArray(partDecl) ? partDecl : [partDecl];
            return Vow.all(partsDecls.map(function (partDecl) {
                partDecl = this._normalizePartDecl(partDecl);
                var parts = this._getPartsByDecl(partDecl);
                if (!parts.length) {
                    return Vow.resolve();
                }
                this._onPartUpdateStart(parts, partDecl);
                return BEMTREE.apply(partDecl, data).then(replaceBlocks, parts);
            }, this));
        }
    });
    provide(IPage);
});
