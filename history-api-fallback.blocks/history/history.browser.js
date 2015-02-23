modules.define('history', ['inherit', 'jquery', 'next-tick'], function (provide, inherit, $, nextTick, History) {

    var works = window.history && window.history.pushState;

    /**
     * @class History
     */
    provide(inherit(History, works ? /**@lends History#*/{
        /**
         * @returns {boolean}
         */
        isNeedToProcessInitialRequest: function () {
            return false;
        },

        /**
         * @returns {String}
         */
        getSensibleUrlFragment: function () {
            return this._getSensibleUrlFragment();
        }
    } : /**@lends History#*/{

        __constructor: function () {
            $(window).on('hashchange', this._onHashChange.bind(this));
            var hash = location.hash;

            /**
             * if we use hash-based navigation
             * we should load pages in the browser
             * even first time
             * @type {boolean}
             * @private
             */
            this._needToProcessInitialRequest = !!hash && hash.charAt(1) === '/' && hash.length > 2;
        },

        /**
         * @returns {String}
         * @protected
         */
        _getSensibleUrlFragment: function () {
            return window.location.hash.replace('#', '');
        },

        /**
         * Changes current state.
         *
         * @param {String} method Push or replace method.
         * @param {Array} args Real method params.
         * @returns {Object}
         * @protected
         */
        _changeState: function (method, args) {
            location.hash = args[2];
            this._sensibleUrlFragment = this._getSensibleUrlFragment();
            return this;
        },

        /**
         * Reaction for hashchange jQuery event.
         * @private
         */
        _onHashChange: function () {
            this._onPopState();
        },

        /**
         * @returns {boolean}
         */
        isNeedToProcessInitialRequest: function () {
            return this._needToProcessInitialRequest;
        },

        /**
         * @returns {String}
         */
        getSensibleUrlFragment: function () {
            return this._getSensibleUrlFragment();
        }
    }));

});
