var PATH = require('path'),
    environ = require('bem-environ'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'bemtree.js');

exports.techMixin = {

    /**
     * todo: remove after https://github.com/bem/bem-xjst/issues/41
     * @param {Array.<string>} sources
     * @returns {string}
     */
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

        var deps = this.getModulesDeps(),
            modulesDeps = deps ? ', ' + JSON.stringify(Object.keys(deps)) : '',
            modulesProvidedDeps = deps ? ', ' + Object.keys(deps).map(function (module) {
                var providedName = deps[module];
                return providedName === true ? module : providedName;
            }).join(', ') : '';

        return '(function(g) {\n' +
            '  var __bem_xjst = function(exports' + modulesProvidedDeps + ') {\n' +
            '     ' + code + ';\n' +
            '     return exports;\n' +
            '  }\n' +
            '  var defineAsGlobal = true;\n' +
            '  if(typeof modules === "object") {\n' +
            '    modules.define("' + exportName + '"' + modulesDeps + ',\n' +
            '      function(provide' + modulesProvidedDeps + ') {\n' +
            '        provide(__bem_xjst({}' + modulesProvidedDeps + ')) });\n' +
            '    defineAsGlobal = false;\n' +
            '  }\n' +
            '  else if(typeof exports === "object") {\n' +
            '    exports["' + exportName + '"] = __bem_xjst({}' + modulesProvidedDeps + ');\n' +
            '    defineAsGlobal = false;\n' +
            '  }\n' +
            '  defineAsGlobal && (g["' + exportName + '"] = __bem_xjst({}' + modulesProvidedDeps + '));\n' +
            '})(this);';
    },

    getModulesDeps: function () {
        return {
            'vow': 'Vow',
            'bemtree-extensions__path': 'path',
            'bemtree-extensions__redirect': 'redirect'
        };
    }
};
