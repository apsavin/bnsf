var PATH = require('path'),
    environ = require('bem-environ'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'browser.js.js');

exports.techMixin = {
    /**
     * @param {string} initialShift
     * @param {string} shift
     * @returns {string}
     * @protected
     */
    _getPageData: function (initialShift, shift) {
        return this.__base(initialShift, shift) + initialShift + "modules.define('i-bem__dom_init', [pageName], function (provide, _, prev) {\n" +
            initialShift + shift + "provide(prev);\n" +
            initialShift + "});\n";
    },

    /**
     * @returns {Array.<String>}
     */
    getBuildSuffixes: function () {
        return ['js', 'routing.js', 'pages.js'];
    }
};
