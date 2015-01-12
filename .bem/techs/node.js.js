var PATH = require('path'),
    environ = require('bem-environ'),
    Vow = require('vow'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'node.js.js');

exports.techMixin = {

    /**
     * @param {Object} decl
     * @param {Array} levels
     * @param {String} output
     * @param {Object} opts
     * @returns {Promise}
     */
    getBuildResults: function (decl, levels, output, opts) {
        return this.__base(decl, levels, output, opts).then(function (res) {
            return this._concatConfigs(res, output).then(function () {
                return res;
            });
        }.bind(this));
    },

    /**
     * @param {Object} res
     * @param {String} output
     * @returns {Promise}
     * @private
     */
    _concatConfigs: function (res, output) {
        return this._getConfigs(output, '.config.node.yml').then(function (configs) {
            this._concat(res, this._pathToBuildResultChunk(output, configs.path));
            return this._writeFile(configs.path, configs.content);
        }, this).fail(function (err) {
            // we can just ignore case if file is not exists
            if (err.code !== 'ENOENT') {
                throw err;
            }
        });
    },

    /**
     * @param {String} output
     * @param {String} suffix
     * @private
     */
    _getConfigs: function (output, suffix) {
        return this._readYmlFileAndReplacePlaceholders(output, suffix, function (content) {
            var output = '';
            for (var key in content) {
                if (content.hasOwnProperty(key)) {
                    output += "modules.define('" + key +
                    "__config', ['objects'], function(provide, objects, config){provide(objects.extend(config, " +
                    JSON.stringify(content[key]) + "));});\n";
                }
            }
            return output;
        });
    },

    /**
     * @param {Object} res
     * @param {String} output
     * @returns {Promise}
     * @protected
     */
    _concatRouting: function (res, output) {
        return Vow.all([
            this.__base(res, output),
            this._concatRoutes(res, output, '.api.routing.yml', 'routes-private')
        ]).then(function (routes) {
            return routes.join('\n');
        });
    },

    /**
     * @param {String} res
     * @param {Array.<String>} decls
     * @param {String} output
     * @returns {Promise}
     * @protected
     */
    _processBlocksFromDecl: function (res, decls, output) {
        return Vow.all([
            this.__base(res, decls, output),
            this._concatControllers(res, decls, output)
        ]);
    },

    /**
     * @returns {string}
     * @private
     */
    _getPagesSuffix: function () {
        return this.__base() + '.node';
    },

    /**
     * @param {Object} res
     * @param {Array.<String>} decls
     * @param {String} output
     * @returns {Promise}
     * @private
     */
    _concatControllers: function (res, decls, output) {
        var controllers = decls.filter(function (name) {
            return /^controller-/.test(name);
        });
        var suffix = 'controllers.node';
        this._concat(res, this._techToBuildResultChunk(output, suffix));
        return this._writeFile(output + '.' + suffix + '.js', this._getControllersData(controllers));
    },

    /**
     * @param {Array.<String>} controllers
     * @returns {string}
     * @private
     */
    _getControllersData: function (controllers) {
        return this._getJSONModuleDefinition('controllers', controllers);
    },

    /**
     * @returns {Array.<String>}
     */
    getBuildSuffixes: function () {
        return ['node.js', 'controllers.node.js', 'api.routing.js', 'config.node.js', 'routing.js', 'pages.node.js'];
    }
};
