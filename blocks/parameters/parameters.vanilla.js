/**@module parameters*/
modules.define('parameters', ['objects'], function (provide, objects) {
    "use strict";

    /**
     * @class Parameters
     */
    provide(/**@lends Parameters*/{

        /**
         * @param {object} parameters
         * @returns {Parameters}
         */
        setParameters: function (parameters) {
            this._parameters = parameters;
            var placeholdersToParameters = this._placeholdersToParameters = {},
                placeholdersWithQuotesToParameters = this._placeholdersWithQuotesToParameters = {},
                placeholders = [];
            objects.each(parameters, function (value, parameter) {
                var placeholder = 's%' + parameter + '%s',
                    placeholderWithQuotes = '\\"' + placeholder + '\\"';
                placeholdersToParameters[placeholder] = parameter;
                placeholdersWithQuotesToParameters['"' + placeholder + '"'] = parameter;
                placeholders.push(placeholder + '|' + placeholderWithQuotes);
            });
            this._placeholders = placeholders.join('|');
            return this;
        },

        /**
         * @returns {object}
         */
        getParameters: function () {
            return this._parameters;
        },

        /**
         * @param {string} configString
         * @returns {*}
         */
        apply: function (configString) {
            if (!this._parameters) {
                throw new Error('no parameters was set into parameters');
            }
            var parameters = this._parameters,
                placeholdersToParameters = this._placeholdersToParameters,
                placeholdersWithQuotesToParameters = this._placeholdersWithQuotesToParameters;
            if (this._placeholders) {
                configString = configString.replace(new RegExp(this._placeholders, 'g'), function (match) {
                    return placeholdersToParameters[match] ?
                        parameters[placeholdersToParameters[match]] :
                        JSON.stringify(parameters[placeholdersWithQuotesToParameters[match]]);
                });
            }
            var parsedConfig;
            try {
                parsedConfig = JSON.parse(configString);
            } catch (e) {
                throw new Error('Malformed config found. Please check your *.yml files and build process.');
            }
            return parsedConfig;
        }
    });
});
