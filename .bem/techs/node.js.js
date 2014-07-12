var PATH = require('path'),
    environ = require('bem-environ'),
    Vow = require('vow'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'node.js.js');

exports.techMixin = {

    _getRoutes: function (output) {
        var promises = [this.__base(output), this.__base(output, '.api.routing.yml', 'routes-private')];
        return Vow.all(promises).then(function (routes) {
            return routes.join('\n');
        });
    },

    _processBlocksFromDecl: function (res, decls) {
        this.__base(res, decls);
        this._concatControllers(res, decls);
    },

    _concatControllers: function (res, decls) {
        var controllers = decls.filter(function (name) {
            return /^controller-/.test(name);
        });
        this._concat(res, this._getControllersData(controllers));
    },

    _getControllersData: function (controllers) {
        return this._getJSONModuleDefinition('controllers', controllers);
    }
};
