/**
 * routes
 * ======
 *
 * Makes routes declaration out of ?.routing.yml
 *
 * **Options**
 *
 * * *String* **target** - `?.routes.js` by default.
 *
 * **Example**
 *
 * ```javascript
 * nodeConfig.addTech(require('path/to/routes', {source: '?.routing.yml'}));
 * ```
 */
module.exports = require('./yml-source-reader')
    .name('routes')
    .defineOption('moduleName', 'routes')
    .defineOption('public', true)
    .useSourceFilename('source', '?.yml')
    .target('target', '?.routes.js')
    .builder(function (parametersFilePath, sourceFilePath) {
        return this._build(parametersFilePath, sourceFilePath);
    })
    .methods({
        /**
         * @param {{content: Array, parameters: object}} result
         * @returns {string}
         * @protected
         */
        _buildResultString: function (result) {
            if (!result.content) {
                this.node.getLogger().logWarningAction('No routes found', this._source, 'read');
                result.content = [];
            }

            return (this._public ?
                    this._getJSONModuleDefinition('parameters__public-names', Object.keys(result.parameters)) : '') +
                this._getConfigModuleDefinition(this._moduleName, result.content);
        }
    })
    .createTech();
