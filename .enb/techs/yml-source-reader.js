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
    VowFs = require('vow-fs'),
    PATH = require('path');

module.exports = require('./base-for-techs-with-modules')
    .useSourceFilename('parameters', '?.parameters.js')
    .methods({
        _build: function (parametersFilePath, sourceFilePath) {
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
            return VowFs.read(path, 'utf8').then(function (content) {
                for (var key in parameters) {
                    if (parameters.hasOwnProperty(key)) {
                        content = content.replace(new RegExp('%' + key + '%', 'g'), parameters[key]);
                    }
                }

                var res;
                try {
                    res = yml.safeLoad(content);
                } catch (e) {
                    this.node.getLogger()
                        .logErrorAction('parsing yml failed', PATH.basename(path), '\n' + e.toString());
                    throw e;
                }
                return res;
            }, this);
        },

        /**
         * @param {string} content
         * @returns {string}
         * @protected
         */
        _buildResultString: function (content) {
            return content;
        },

        /**
         * @param {Error} err
         * @protected
         */
        _processError: function (err) {
            throw err;
        }
    });
