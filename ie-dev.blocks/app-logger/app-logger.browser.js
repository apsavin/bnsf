/**@module app-logger*/
modules.define('app-logger', ['logger'], function (provide, Logger) {
    "use strict";
    /**
     * @exports Logger
     */
    provide(new Logger(null, {
        logger: /**@class InternetExplorerConsoleLogger*/{
            /**
             * @param {string} level
             * @param {Array.<String>} messages
             * @returns {InternetExplorerConsoleLogger}
             * @private
             */
            _report: function (level, messages) {
                if (typeof console !== 'undefined') {
                    console[level](Array.prototype.join.call(messages, ' '));
                }
                return this;
            },

            /**
             * @param {string} message
             * @returns {InternetExplorerConsoleLogger}
             */
            info: function (message) {
                return this._report('info', arguments);
            },

            /**
             * @param {string} message
             * @returns {InternetExplorerConsoleLogger}
             */
            warn: function (message) {
                return this._report('warn', arguments);
            },

            /**
             * @param {string} message
             * @returns {InternetExplorerConsoleLogger}
             */
            error: function (message) {
                return this._report('error', arguments);
            }
        }
    }));
});
