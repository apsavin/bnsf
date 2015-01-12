var PATH = require('path'),
    environ = require('bem-environ'),
    fs = require('fs'),
    Vow = require('vow'),
    yml = require('js-yaml'),
    defaults = require('lodash.defaults'),
    LOGGER = require('bem/lib/logger'),
    config,

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'vanilla.js.js');

exports.techMixin = {

    /**
     * @param {Object} decl
     * @param {Array} levels
     * @param {String} output
     * @param {Object} opts
     * @returns {Promise}
     */
    getBuildResults: function (decl, levels, output, opts) {
        var _this = this,
            res = {},
            files = this.getBuildPaths(decl, levels);

        return files.then(function (files) {
            var destSuffix = _this._getBuildSuffix(),
                filteredFiles = files[destSuffix] || [],
                file = _this.getPath(output, destSuffix);

            return _this.validate(file, filteredFiles, opts).then(function (valid) {
                LOGGER.fverbose('file %s is %s', file, valid ? 'valid' : 'not valid');

                if (!valid) {

                    return _this.getBuildResult(filteredFiles, destSuffix, output, opts)
                        .then(function (r) {
                            res[destSuffix] = r;
                            return _this.saveLastUsedData(file, { buildFiles: filteredFiles });
                        });
                }
            });
        }).then(function () {
            _this._concatTemplates(res, output);
            return Vow.all([
                _this._concatBlocksFromDecl(res, output),
                _this._concatRouting(res, output)
            ]).then(function () {
                return res;
            });
        });
    },

    /**
     * @returns {String}
     * @private
     */
    _getBuildSuffix: function () {
        return this.getBuildSuffixes()[0];
    },

    /**
     * @param {Object} res
     * @param {String} text
     * @protected
     */
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

    /**
     * @param {Object} res
     * @param {String} output
     * @returns {Promise}
     * @private
     */
    _concatBlocksFromDecl: function (res, output) {
        var decls = require(output + '.bemdecl.js').blocks
            .map(function (block) {
                return block.name;
            });
        return this._processBlocksFromDecl(res, decls, output);
    },

    /**
     * @param {Object} res
     * @param {Array.<String>} decls
     * @param {String} output
     * @returns {Promise}
     * @protected
     */
    _processBlocksFromDecl: function (res, decls, output) {
        return this._concatPages(res, decls, output);
    },

    /**
     * @param {Object} res
     * @param {Array.<String>} decls
     * @param {String} output
     * @returns {Promise}
     * @private
     */
    _concatPages: function (res, decls, output) {
        var pages = decls.filter(function (name) {
            return /^page-/.test(name);
        });
        var suffix = this._getPagesSuffix();
        this._concat(res, this._techToBuildResultChunk(output, suffix));
        return this._writeFile(output + '.' + suffix + '.js', this._getPagesData(pages));
    },

    /**
     * @returns {string}
     * @private
     */
    _getPagesSuffix: function () {
        return 'pages';
    },

    /**
     * @param {Array.<String>} pages
     * @returns {String}
     * @protected
     */
    _getPagesData: function (pages) {
        var shift = '    ';
        return '(function (pages, modules) {\n' +
            shift + this._getModuleDefinition('pages', 'pages') +
            shift + 'pages.forEach(function (pageName) {\n' +
            this._getPageData(shift + shift, shift) +
            shift + '});\n' +
            '})(' + JSON.stringify(pages) + ', modules);';
    },

    /**
     * @param {string} initialShift
     * @param {string} shift
     * @returns {string}
     * @protected
     */
    _getPageData: function (initialShift, shift) {
        return initialShift + "modules.define(pageName, ['i-page'], function (provide, Page, prev) {\n" +
            initialShift + shift + "provide(prev || Page.decl(this.name, {}));\n" +
            initialShift + "});\n";
    },

    /**
     * @param {string} name
     * @param {string} data
     * @returns {string}
     * @protected
     */
    _getModuleDefinition: function (name, data) {
        return "modules.define('" + name + "', function(provide){provide(" + data + ");});\n";
    },

    /**
     * @param {String} name
     * @param {Object} data
     * @returns {string}
     * @protected
     */
    _getJSONModuleDefinition: function (name, data) {
        return this._getModuleDefinition(name, JSON.stringify(data));
    },

    /**
     * @param {String} path
     * @param {String} content
     * @returns {Promise}
     * @private
     */
    _writeFile: function (path, content) {
        var deferred = Vow.defer();
        fs.writeFile(path, content, function (err) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve();
            }
        });
        return deferred.promise();
    },

    /**
     * @param {String} path
     * @param {String} [encoding]
     * @returns {Promise}
     * @private
     */
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

    /**
     * @param {String} output
     * @returns {Promise}
     * @private
     */
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

    /**
     * @param {String} output
     * @param {String} suffix
     * @param {String} moduleName
     * @returns {Promise}
     * @protected
     */
    _getRoutes: function (output, suffix, moduleName) {
        return this._readYmlFileAndReplacePlaceholders(output, suffix, function (content) {
            if (!content) {
                LOGGER.warn('There is no routes in %s%s', output, suffix);
                content = [];
            }
            return this._getJSONModuleDefinition(moduleName, content);
        });
    },

    /**
     * @param {string} output
     * @param {string} suffix
     * @param {Function} contentWrapper
     * @returns {Promise}
     * @protected
     */
    _readYmlFileAndReplacePlaceholders: function (output, suffix, contentWrapper) {
        var path = output + suffix;
        return Vow.all([this._getConfig(output), this._readFile(path)])
            .spread(function (config, content) {
                for (var key in config) {
                    if (config.hasOwnProperty(key)) {
                        content = content.replace(new RegExp('%' + key + '%', 'g'), config[key]);
                    }
                }
                return {
                    path: path.replace('yml', 'js'),
                    content: contentWrapper.call(this, yml.safeLoad(content))
                };
            }, this);
    },

    /**
     * @param {Object} res
     * @param {String} output
     * @returns {Promise}
     * @protected
     */
    _concatRouting: function (res, output) {
        return this._concatRoutes(res, output, '.routing.yml', 'routes');
    },

    /**
     * @param {Object} res
     * @param {String} output
     * @param {String} suffix
     * @param {String} moduleName
     * @returns {Promise}
     * @protected
     */
    _concatRoutes: function (res, output, suffix, moduleName) {
        return this._getRoutes(output, suffix, moduleName).then(function (routes) {
            this._concat(res, this._pathToBuildResultChunk(output, routes.path));
            return this._writeFile(routes.path, routes.content);
        }, this);
    },

    /**
     * @param {Object} res
     * @param {String} output
     * @private
     */
    _concatTemplates: function (res, output) {
        var templates = ['bemhtml', 'bemtree'].map(function (techName) {
            return this._techToBuildResultChunk(output, techName);
        }, this);

        this._concat(res, templates.join('\n'));
    },

    /**
     * @param {String} output
     * @param {String} techName
     * @returns {String}
     * @private
     */
    _techToBuildResultChunk: function (output, techName) {
        return this._pathToBuildResultChunk(output, output + '.' + techName + '.js');
    },

    /**
     * @param {String} output
     * @param {String} path
     * @returns {String}
     * @private
     */
    _pathToBuildResultChunk: function (output, path) {
        return this.getBuildResultChunk(PATH.relative(PATH.resolve(output, '..'), path));
    },

    /**
     * @returns {string[]}
     */
    getDependencies: function () {
        return ['bemdecl.js', 'bemhtml.js', 'bemtree.js'];
    }
};
