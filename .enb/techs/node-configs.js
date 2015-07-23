/**
 * node-configs
 * ======
 *
 * Makes node-configs declaration out of ?.config.node.yml
 *
 * **Options**
 *
 * * *String* **target** - `?.config.node.js` by default.
 *
 * **Example**
 *
 * ```javascript
 * nodeConfig.addTech(require('path/to/node-configs', {source: '?.config.node.yml'}));
 * ```
 */
var path = require('path');

module.exports = require('./yml-source-reader')
    .name('node-configs')
    .target('target', '?.config.node.js')
    .builder(function (parametersFilePath) {
        return this._build(parametersFilePath, this.node.resolvePath(this.node.unmaskTargetName('?.config.node.yml')));
    })
    .methods({

        /**
         * @returns {string}
         * @private
         */
        _getParametersPathsModule: function () {
            var fileName = path.basename(this._parametersFilePath);
            return this._getJSONModuleDefinition('parameters__files-names', [
                fileName.replace('.js', '.yml'),
                fileName.replace('.js', '.dist.yml')
            ]);
        },

        /**
         * @param {object} result
         * @returns {string}
         * @protected
         */
        _buildResultString: function (result) {
            var output = this._getParametersPathsModule(),
                content = result.content;

            if (!content) {
                return output;
            }

            for (var key in content) {
                if (content.hasOwnProperty(key)) {
                    output += this._getConfigModuleDefinition(key + '__config', content[key]) + "\n";
                }
            }
            return output;
        },

        /**
         * @param {Error} err
         * @protected
         */
        _processError: function (err) {
            // we can just ignore case if file is not exists
            if (err.code === 'ENOENT') {
                return this._getParametersPathsModule();
            }
            throw err;
        }
    })
    .createTech();
