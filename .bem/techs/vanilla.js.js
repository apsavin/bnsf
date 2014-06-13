var PATH = require('path'),
    environ = require('bem-environ'),
    fs = require('fs'),
    Vow = require('vow'),
    yml = require('js-yaml'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'vanilla.js.js');

exports.techMixin = {

    getBuildResults: function (decl, levels, output, opts) {
        var _this = this;

        return this.__base(decl, levels, output, opts)
            .then(function (res) {
                return _this._concatTemplates(res, output)
                    .then(function () {
                        _this._concatBlocksFromDecl(res, output);
                        _this._concatRouting(res, output);
                        return res;
                    });

            });
    },

    _concat: function (res, text) {
        Object.keys(res).forEach(function (suffix) {
            // test for array as in i18n.js+bemhtml tech
            // there's hack to create symlink for default lang
            // so 'js' key is a string there
            Array.isArray(res[suffix]) && res[suffix].push(text);
        });
    },

    _concatBlocksFromDecl: function (res, output) {
        var decls = require(output + '.bemdecl.js').blocks
            .map(function (block) {
                return block.name
            });
        this._processBlocksFromDecl(res, decls);
    },

    _processBlocksFromDecl: function (res, decls) {
        this._concatPages(res, decls);
    },

    _concatPages: function (res, decls) {
        var pages = decls.filter(function (name) {
            return /^page-/.test(name)
        });
        this._concat(res, this._getPagesData(pages));
    },

    _getPagesData: function (pages) {
        return this._getJSONModuleDefinition('pages', pages);
    },

    _getJSONModuleDefinition: function (name, data) {
        return "\nmodules.define('" + name + "', function(provide){provide(" + JSON.stringify(data) + ");});";
    },

    _getRoutes: function (output) {
        var routes = yml.safeLoad(fs.readFileSync(output + '.routing.yml', 'utf8'));
        return this._getJSONModuleDefinition('routes', routes);
    },

    _concatRouting: function (res, output) {
        this._concat(res, this._getRoutes(output));
    },

    _concatTemplates: function (res, output) {
        var deferred = Vow.defer(),
            templatesTechsNames = ['bemhtml', 'bemtree'],
            templates = [],
            onFile = function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    templates.push(data);
                    // put templates at the bottom of builded js file
                    if (templates.length === templatesTechsNames.length) {
                        this._concat(res, templates.join('\n'));
                        deferred.resolve(res);
                    }
                }
            }.bind(this);

        templatesTechsNames.forEach(function (techName) {
            fs.readFile(output + '.' + techName + '.js', onFile);
        });

        return deferred.promise();
    },

    getDependencies: function () {
        return ['bemhtml', 'bemtree'];
    }
};
