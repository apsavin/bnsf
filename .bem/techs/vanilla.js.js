var PATH = require('path'),
    environ = require('bem-environ'),
    fs = require('fs'),
    Vow = require('vow'),
    yml = require('js-yaml'),
    defaults = require('lodash.defaults'),
    config,

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
                        return _this._concatRouting(res, output);
                    }).then(function () {
                        return res;
                    });

            });
    },

    _concat: function (res, text) {
        Object.keys(res).forEach(function (suffix) {
            // test for array as in i18n.js+bemhtml tech
            // there's hack to create symlink for default lang
            // so 'js' key is a string there
            if (Array.isArray(res[suffix])) {
                res[suffix].push(text);
            }
        });
    },

    _concatBlocksFromDecl: function (res, output) {
        var decls = require(output + '.bemdecl.js').blocks
            .map(function (block) {
                return block.name;
            });
        this._processBlocksFromDecl(res, decls);
    },

    _processBlocksFromDecl: function (res, decls) {
        this._concatPages(res, decls);
    },

    _concatPages: function (res, decls) {
        var pages = decls.filter(function (name) {
            return /^page-/.test(name);
        });
        this._concat(res, this._getPagesData(pages));
    },

    _getPagesData: function (pages) {
        return this._getJSONModuleDefinition('pages', pages);
    },

    _getJSONModuleDefinition: function (name, data) {
        return "\nmodules.define('" + name + "', function(provide){provide(" + JSON.stringify(data) + ");});";
    },

    _readFile: function (path, encoding) {
        var deferred = Vow.defer();
        fs.readFile(path, encoding || 'utf8', function (err, data) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(data);
            }
        });
        return deferred.promise();
    },

    _getConfig: function (output) {
        if (config) {
            return Vow.fulfill(config);
        }

        var promises = [output + '.parameters.dist.yml', output + '.parameters.yml'].map(function (path) {
            return this._readFile(path);
        }, this);

        return Vow.allResolved(promises).then(function (result) {
            var configs = result.map(function (promise) {
                return promise.isRejected() ? {} : yml.safeLoad(promise.valueOf());
            });
            config = defaults(configs[1], configs[0]);
            return config;
        }, this);
    },

    _getRoutes: function (output, suffix, moduleName) {
        suffix = suffix || '.routing.yml';
        moduleName = moduleName || 'routes';
        return Vow.all([this._getConfig(output), this._readFile(output + suffix)])
            .spread(function (config, routing) {
                for (var key in config) {
                    if (config.hasOwnProperty(key)) {
                        routing = routing.replace(new RegExp('%' + key + '%', 'g'), config[key]);
                    }
                }
                return this._getJSONModuleDefinition(moduleName, yml.safeLoad(routing));
            }, this);
    },

    _concatRouting: function (res, output) {
        return this._getRoutes(output).then(function (routes) {
            this._concat(res, routes);
        }, this);
    },

    _concatTemplates: function (res, output) {
        var promises = ['bemhtml', 'bemtree'].map(function (techName) {
            return this._readFile(output + '.' + techName + '.js');
        }, this);

        return Vow.all(promises).then(function (templates) {
            this._concat(res, templates.join('\n'));
        }, this);
    },

    getDependencies: function () {
        return ['bemhtml', 'bemtree'];
    }
};
