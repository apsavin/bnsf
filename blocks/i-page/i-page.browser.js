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
        return this.forEach(replaceBlock, BEMHTML.apply(BEMJSON));
    };

    /**
     * @param {Element} el
     * @returns {jQuery}
     */
    var wrapJQuery = function (el) {
        return $(el);
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
            var partsForUpdate = this.params.update;
            if (!partsForUpdate) {
                return null;
            }
            return this._update.call(this, partsForUpdate, data);
        },

        /**
         * runs when user leaves the page
         * you can show a page-related spinner here
         * @public
         */
        leave: function () {
        },

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
        },

        /**
         * @param {string|{block: string|undefined, elem: string|undefined}} decl
         * @returns {{block: string, elem: string|undefined}}
         * @private
         */
        _normalizePartDecl: function (decl) {
            decl = typeof decl === 'string' ? { block: decl } : decl;
            decl.block = decl.block || this.__self.getName();
            return decl;
        },

        /**
         * @param {{block: string, elem: string|undefined}} decl
         * @returns {Array.<BEMDOM|jQuery>}
         * @private
         */
        _getPartsByDecl: function (decl) {
            var parts;
            if (decl.block !== this.__self.getName()) {
                parts = this.findBlocksInside(decl.block);
                if (decl.elem) {
                    parts = parts.map(function (part) {
                        return part.findElem(decl.elem);
                    });
                }
            } else {
                parts = this.findElem(decl.elem);
            }
            if (!Array.isArray(parts)) {
                parts = $.map(parts, wrapJQuery);
            }
            return parts;
        },

        /**
         * @param {Array.<BEMDOM|jQuery>} parts
         * @param {string|object} decl
         * @protected
         */
        _onPartUpdateStart: function (parts, decl) {
        }

    });
    provide(IPage);
});
