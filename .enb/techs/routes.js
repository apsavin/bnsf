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
    .useSourceFilename('source', '?.yml')
    .target('target', '?.routes.js')
    .builder(function (parametersFilePath, sourceFilePath) {
        return this._build(parametersFilePath, sourceFilePath);
    })
    .methods({
        /**
         * @param {Array} content
         * @returns {string}
         * @protected
         */
        _buildResultString: function (content) {
            if (!content) {
                this.node.getLogger().logWarningAction('No routes found', this._source, 'read');
                content = [];
            }
            return this._getJSONModuleDefinition(this._moduleName, content);
        }
    })
    .createTech();
