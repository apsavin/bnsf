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

        info: function (message) {
            this._logger.info.apply(console, arguments);
        },

        warn: function (message) {
            this._logger.warn.apply(console, arguments);
        },

        error: function (message) {
            this._logger.error.apply(console, arguments);
        }
    }));
});
