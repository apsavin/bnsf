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
var vowFs = require('vow-fs'),
    inherit = require('inherit'),
    yml = require('js-yaml');

module.exports = inherit(require('enb').BaseTech, {
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
        var target = this.node.unmaskTargetName(this._target),
            targetPath = this.node.resolvePath(target),
            sourceParameters = '?.parameters.dist.yml';

        return vowFs.read(this._getSourcePathByMask(sourceParameters), 'utf8')
            .then(function (content) {
                return yml.safeLoad(content) || {};
            }, function () {
                return {};
            }, this)
            .then(function (result) {
                return vowFs.write(targetPath, 'module.exports=' + JSON.stringify(result) + ';');
            })
            .then(function () {
                this.node.resolveTarget(target);
            }, this)
            .fail(function (err) {
                this.node.rejectTarget(target, err);
            }, this);
    }
});
