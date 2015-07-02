/**
 * base-for-techs-with-modules
 * =======
 *
 * Base tech for techs with ym modules-based output
 *
 */
module.exports = require('enb/lib/build-flow').create()
    .methods({

        /**
         * @param {string} name
         * @param {string} data
         * @returns {string}
         * @protected
         */
        _getModuleDefinition: function (name, data) {
            return "modules.define('" + name + "', function(provide){provide(" + data + ");});\n";
        },

        /**
         * @param {String} name
         * @param {Object} data
         * @returns {string}
         * @protected
         */
        _getJSONModuleDefinition: function (name, data) {
            return this._getModuleDefinition(name, JSON.stringify(data));
        }
    });
