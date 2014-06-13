var PATH = require('path'),
    environ = require('bem-environ'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'browser.js.js');

exports.techMixin = {

    _getPagesData: function (pages) {
        var data = this.__base(pages);
        return data + pages.map(function (pageName) {
            return "modules.define('i-bem__dom_init', ['" + pageName + "'], function(provide, _, prev) {provide(prev);});";
        }).join('\n');
    }
};
