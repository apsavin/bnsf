var PATH = require('path'),
    environ = require('bem-environ'),
    fs = require('fs'),
    yml = require('js-yaml'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'node.js.js');

exports.techMixin = {

    _getRoutes: function (output) {
        var routes = yml.safeLoad(fs.readFileSync(output + '.api.routing.yml', 'utf8'));
        return this.__base(output) +
            this._getJSONModuleDefinition('routes-private', routes);
    },

    _processBlocksFromDecl: function (res, decls) {
        this.__base(res, decls);
        this._concatControllers(res, decls);
    },

    _concatControllers: function (res, decls) {
        var controllers = decls.filter(function (name) {
            return /^controller-/.test(name)
        });
        this._concat(res, this._getControllersData(controllers));
    },

    _getControllersData: function (controllers) {
        return this._getJSONModuleDefinition('controllers', controllers);
    }
};
