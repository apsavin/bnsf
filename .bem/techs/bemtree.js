var PATH = require('path'),
    environ = require('bem-environ'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'bemtree.js');

exports.techMixin = {

    getCompiledResult: function (sources) {
        sources = sources.join('\n');

        var BEMHTML = require('bem-xjst/lib/bemhtml'),
            exportName = this.getExportName(),
            optimize = process.env[exportName + '_ENV'] !== 'development',
            code = BEMHTML.generate(sources, {
                wrap: false,
                exportName: exportName,
                optimize: optimize,
                cache: optimize && process.env[exportName + '_CACHE'] === 'on'
            });

        return '(function(g) {\n' +
            "  modules.define('" + exportName + "', ['vow', 'app-router-base'], function(provide, Vow, router) { \n" +
            '  var path = router.generate.bind(router),\n'+
            '      redirect = function (path) {\n'+
            '          var error = new Error("Redirect needed");error.path = path;error.redirect = true;\n'+
            '          throw error;\n'+
            '      };\n'+
            '  var __bem_xjst = (function(exports) {\n' +
            '     ' + code + ';\n' +
            '     return exports;\n' +
            '  })({});\n' +
            "  provide(__bem_xjst); \n" +
            "});\n" +
            '})(this);';
    }
};
