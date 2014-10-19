var PATH = require('path'),
    environ = require('bem-environ'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'browser.js.js');

exports.techMixin = {

    /**
     * @param {Array.<String>} pages
     * @returns {String}
     * @protected
     */
    _getPagesData: function (pages) {
        var data = this.__base(pages);
        return data + pages.map(function (pageName) {
            return "modules.define('i-bem__dom_init', ['" + pageName + "'], function(provide, _, prev) {provide(prev);});";
        }).join('\n');
    },

    /**
     * @returns {Array.<String>}
     */
    getBuildSuffixes: function () {
        return ['js', 'routing.js', 'pages.js'];
    }
};
