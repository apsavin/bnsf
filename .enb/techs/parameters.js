/**
 * parameters
 * ==========
 *
 * Makes ?.parameters.js out of ?.parameters.yml and ?.parameters.dist.yml
 * Both yml files are optional
 *
 * **Example**
 *
 * ```javascript
 * nodeConfig.addTech([ require('path/to/parameters') ]);
 * ```
 */
var Vow = require('vow'),
    VowFs = require('vow-fs'),
    inherit = require('inherit'),
    yml = require('js-yaml'),
    defaults = require('lodash.defaults');

module.exports = inherit(require('enb/lib/tech/base-tech'), {
    getName: function () {
        return 'parameters';
    },

    configure: function () {
        this._target = '?.parameters.js';
    },

    getTargets: function () {
        return [this.node.unmaskTargetName(this._target)];
    },

    /**
     * @param {string} source
     * @returns {string}
     * @private
     */
    _getSourcePathByMask: function (source) {
        return this.node.resolvePath(this.node.unmaskTargetName(source));
    },

    build: function () {
        var target = this.node.unmaskTargetName(this._target);
        var targetPath = this.node.resolvePath(target);
        var sourceParameters = '?.parameters.yml';
        var sourceParametersDist = '?.parameters.dist.yml';
        var promises = [
            this._getSourcePathByMask(sourceParametersDist),
            this._getSourcePathByMask(sourceParameters)
        ].map(function (path) {
                return VowFs.read(path, 'utf8');
            });

        return Vow.allResolved(promises)
            .then(function (result) {
                var parameters = result.map(function (promise) {
                    return promise.isRejected() ? {} : (yml.safeLoad(promise.valueOf()) || {});
                });
                return 'module.exports=' + JSON.stringify(defaults(parameters[1], parameters[0])) + ';';
            }, this)
            .then(function (content) {
                return VowFs.write(targetPath, content);
            })
            .then(function () {
                this.node.resolveTarget(target);
            }, this)
            .fail(function (err) {
                this.node.rejectTarget(target, err);
            }, this);
    }
});
