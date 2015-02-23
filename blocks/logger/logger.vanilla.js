/**@module logger*/
modules.define('logger', ['i-bem', 'functions'], function (provide, BEM, functions) {
    "use strict";

    /**
     * @class Logger
     * @extends BEM
     * @exports
     */
    provide(BEM.decl(this.name, /**@lends Logger.prototype*/{

        /**
         * @protected
         * @returns {{logger: {info: Function, warn: Function, error: Function}}
         */
        getDefaultParams: function () {
            return {
                logger: {
                    info: functions.noop,
                    warn: functions.noop,
                    error: functions.noop
                }
            };
        },

        onSetMod: {
            js: {
                inited: function () {
                    this._logger = this.params.logger;
                }
            }
        },

        /**
         * @param {string} level
         * @param {Array.<String>} messages
         * @returns {Logger}
         * @private
         */
        _report: function (level, messages) {
            this._logger[level].apply(this._logger, messages);
            return this;
        },

        /**
         * @param {String} message
         * @returns {Logger}
         */
        info: function (message) {
            return this._report('info', Array.prototype.slice.call(arguments));
        },

        /**
         * @param {String} message
         * @returns {Logger}
         */
        warn: function (message) {
            return this._report('warn', Array.prototype.slice.call(arguments));
        },

        /**
         * @param {String} message
         * @returns {Logger}
         */
        error: function (message) {
            return this._report('error', Array.prototype.slice.call(arguments));
        }
    }));
});
