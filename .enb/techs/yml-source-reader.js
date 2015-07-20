/**
 * yml-source-reader
 * =======
 *
 * Base tech for routes and config
 *
 * **Options**
 *
 * * *String* **source**
 */

var yml = require('js-yaml'),
    vowFs = require('vow-fs'),
    PATH = require('path');

module.exports = require('./base-for-techs-with-modules')
    .useSourceFilename('parameters', '?.parameters.js')
    .methods({
        _build: function (parametersFilePath, sourceFilePath) {
            this._parametersFilePath = parametersFilePath;
            return this._readYmlFileAndReplacePlaceholders(sourceFilePath, require(parametersFilePath))
                .then(this._buildResultString, this)
                .fail(this._processError, this);
        },

        /**
         * @param {string} path
         * @param {object} parameters
         * @returns {Promise}
         * @protected
         */
        _readYmlFileAndReplacePlaceholders: function (path, parameters) {
            return vowFs.read(path, 'utf8').then(function (content) {
                var parametersInUse = {},
                    parametersNames = Object.keys(parameters),
                    namesWithPercentsToNames = {},
                    placeholders;

                placeholders = parametersNames.map(function (parameterName) {
                    var placeholder = '%' + parameterName + '%';
                    namesWithPercentsToNames[placeholder] = parameterName;
                    return placeholder;
                });

                if (placeholders.length) {
                    // we need this replace because % is reserved symbol in yml
                    content = content.replace(new RegExp(placeholders.join('|'), 'g'), function (match) {
                        var key = namesWithPercentsToNames[match];
                        parametersInUse[key] = parameters[key];
                        return 's' + match + 's';
                    });
                }

                var res;
                try {
                    res = yml.safeLoad(content);
                } catch (e) {
                    this.node.getLogger()
                        .logErrorAction('parsing yml failed', PATH.basename(path), '\n' + e.toString());
                    throw e;
                }
                return { content: res, parameters: parametersInUse };
            }, this);
        },

        /**
         * @param {string} moduleName
         * @param {*} content
         * @returns {string}
         * @private
         */
        _getConfigModuleDefinition: function (moduleName, content) {
            return "modules.define('" + moduleName + "', [" +
                "'parameters'" +
                "], function(provide, parameters){" +
                "provide(parameters.apply(" +
                    // double JSON.stringify because we need a string
                JSON.stringify(JSON.stringify(content)) +
                "));});\n";
        },

        /**
         * @param {{content: *, parameters: object}} result
         * @returns {string}
         * @protected
         */
        _buildResultString: function (result) {
            return result.content;
        },

        /**
         * @param {Error} err
         * @protected
         */
        _processError: function (err) {
            throw err;
        }
    });
