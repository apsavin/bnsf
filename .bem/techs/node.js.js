var PATH = require('path'),
    environ = require('bem-environ'),
    Vow = require('vow'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'node.js.js');

exports.techMixin = {

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
    getBuildSuffixes : function() {
        return ['node.js', 'controllers.node.js', 'api.routing.js', 'routing.js', 'pages.js'];
    }
};
