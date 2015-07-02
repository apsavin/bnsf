/**
 * pages-browser
 * =======
 *
 * Makes pages declaration for browser out of ?.decl.js
 *
 * **Options**
 *
 * * *String* **target** - `?.pages.node.js` by default.
 *
 * **Example**
 *
 * ```javascript
 * nodeConfig.addTech(require('path/to/pages-browser'));
 * ```
 */
module.exports = require('./pages').buildFlow()
    .name('pages-browser')
    .target('target', '?.pages.js')
    .methods({
        /**
         * @param {string} initialShift
         * @param {string} shift
         * @returns {string}
         * @protected
         */
        _getPageData: function (initialShift, shift) {
            return this._getPageModuleDefinition(initialShift, shift) + initialShift + "modules.define('i-bem__dom_init', [pageName], function (provide, _, prev) {\n" +
                initialShift + shift + "provide(prev);\n" +
                initialShift + "});\n";
        }
    })
    .createTech();
