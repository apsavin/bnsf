/**
 * pages
 * =======
 *
 * Makes pages declaration out of ?.decl.js
 *
 * **Options**
 *
 * * *String* **target** - `?.pages.node.js` by default.
 *
 * **Example**
 *
 * ```javascript
 * nodeConfig.addTech(require('path/to/pages'));
 * ```
 */
module.exports = require('./bemdecl-reader')
    .name('pages')
    .target('target', '?.pages.node.js')
    .methods({
        /**
         * @param {string} blockName
         * @returns {boolean}
         * @protected
         */
        _checkBlockName: function (blockName) {
            return /^page-/.test(blockName);
        },

        /**
         * @param {Array.<String>} pages
         * @returns {String}
         * @protected
         */
        _getResultString: function (pages) {
            var shift = '    ';
            return '(function (pages, modules) {\n' +
                shift + this._getModuleDefinition('pages', 'pages') +
                shift + 'pages.forEach(function (pageName) {\n' +
                this._getPageData(shift + shift, shift) +
                shift + '});\n' +
                '})(' + JSON.stringify(pages) + ', modules);';
        },

        /**
         * @param {string} initialShift
         * @param {string} shift
         * @returns {string}
         * @protected
         */
        _getPageData: function (initialShift, shift) {
            return this._getPageModuleDefinition(initialShift, shift);
        },

        /**
         * @param {string} initialShift
         * @param {string} shift
         * @returns {string}
         * @protected
         */
        _getPageModuleDefinition: function (initialShift, shift) {
            return initialShift + "modules.define(pageName, ['i-page'], function (provide, Page, prev) {\n" +
                initialShift + shift + "provide(prev || Page.decl(this.name, {}));\n" +
                initialShift + "});\n";
        }
    })
    .createTech();
