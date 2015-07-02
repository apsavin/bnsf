// todo: remove after https://github.com/bem/bem-xjst/pull/61 is merged

var bemxjst = require('bem-xjst'),
    BemxjstProcessor = require('sibling').declare({
        process: function (source, options) {
            return bemxjst.generate(source, options);
        }
    });

module.exports = require('enb-bemxjst/techs/bemtree').buildFlow()
    .methods({
        _bemxjstProcess: function (source) {
            var bemxjstProcessor = BemxjstProcessor.fork();

            return bemxjstProcessor.process(source, {
                wrap: false,
                exportName: this._exportName,
                optimize: !this._devMode,
                cache: !this._devMode && this._cache,
                modulesDeps: this._modulesDeps
            })
                .then(function (code) {
                    bemxjstProcessor.dispose();

                    var deps = this._modulesDeps,
                        modulesDeps,
                        modulesProvidedDeps,
                        allGlobalsDefinedCheck;

                    if (!deps) {
                        modulesDeps = '';
                        modulesProvidedDeps = '';
                        allGlobalsDefinedCheck = 'true';
                    } else {
                        modulesDeps = ', ' + JSON.stringify(Object.keys(deps));
                        var modulesProvidedDepsNames = Object.keys(deps).map(function (module) {
                            var providedName = deps[module];
                            return providedName === true ? module : providedName;
                        });
                        modulesProvidedDeps = ', ' + modulesProvidedDepsNames.join(', ');
                        allGlobalsDefinedCheck = 'typeof ' + modulesProvidedDepsNames.join(' !== "undefined" && typeof ') + ' !== "undefined"';
                    }

                    return '(function(g) {\n' +
                        '  var __bem_xjst = function(exports' + modulesProvidedDeps + ') {\n' +
                        '     ' + code + ';\n' +
                        '     return exports;\n' +
                        '  }\n' +
                        '  var defineAsGlobal = true;\n' +
                        '  if(typeof exports === "object" && ' + allGlobalsDefinedCheck + ') {\n' +
                        '    exports["' + this._exportName + '"] = __bem_xjst({}' + modulesProvidedDeps + ');\n' +
                        '    defineAsGlobal = false;\n' +
                        '  }\n' +
                        '  if(typeof modules === "object") {\n' +
                        '    modules.define("' + this._exportName + '"' + modulesDeps + ',\n' +
                        '      function(provide' + modulesProvidedDeps + ') {\n' +
                        '        provide(__bem_xjst({}' + modulesProvidedDeps + ')) });\n' +
                        '    defineAsGlobal = false;\n' +
                        '  }\n' +
                        '  defineAsGlobal && (g["' + this._exportName + '"] = __bem_xjst({}' + modulesProvidedDeps + '));\n' +
                        '})(this);';
                }, this);
        }
    })
    .createTech();
