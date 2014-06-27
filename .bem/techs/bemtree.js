var PATH = require('path'),
    environ = require('bem-environ'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'bemtree.js');

exports.techMixin = {

    getCompiledResult: function (sources) {
        sources = sources.join('\n');

        var BEMHTML = require('bem-xjst/lib/bemhtml'),
            exportName = this.getExportName(),
            optimize = false, //process.env[exportName + '_ENV'] !== 'development',
            code = BEMHTML.generate(sources, {
                wrap: false,
                exportName: exportName,
                optimize: optimize,
                cache: optimize && process.env[exportName + '_CACHE'] === 'on'
            });

        return '(function(g) {\n' +
            "  modules.define('" + exportName + "', ['vow', 'app-router-base', 'app-api-requester'], function(provide, Vow, router, apiRequester) { \n" +
            '  var path = router.generate.bind(router),\n' +
            '      get = function(o){\n' +
            '          if (typeof o === "object") {\n' +
            '              var args = Array.prototype.slice.call(arguments, 1);\n' +
            '              return o.doAsync(function(){return apiRequester.get.apply(apiRequester, args);});\n' +
            '          }\n' +
            '          return apiRequester.get.apply(apiRequester, arguments);\n' +
            '      },\n' +
            '      __bem_xjst = (function(exports) {\n' +
            '     ' + code + ';\n' +
            '     return exports;\n' +
            '  })({});\n' +
            "  provide(__bem_xjst); \n" +
            "});\n" +
            '})(this);'
    }
};
