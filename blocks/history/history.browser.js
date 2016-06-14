modules.define('history', ['inherit', 'events', 'jquery'], function (provide, inherit, events, $) {

    /**
     * @class History
     * @extends Emitter
     */
    provide(inherit(events.Emitter, /**@lends History#*/{

        /**
         * @constructs
         */
        __constructor: function () {
            var state = window.history.state;

            // Replace null with empty object to catch initial popstate.
            // Initial val must be null (in specification).
            // But in the UC browser for Android history.state is always undefined.
            if(state === null || typeof state === 'undefined') {
                // In the Chrome browser for iOS when history.state
                // replaced with undefined the popstate event will not be triggered.
                // So, we can replace it with empty object.
                window.history.replaceState({}, document.title, window.location.href);
            }
            this._sensibleUrlFragment = this._getSensibleUrlFragment();
            $(window).on('popstate', this._onPopState.bind(this));
        },

        /**
         * @returns {String}
         * @protected
         */
        _getSensibleUrlFragment: function () {
            var url = window.location;
            return url.pathname + url.search;
        },

        /**
         * Adds new state to browsing history.
         *
         * @param {Object} state New state.
         * @param {String} title Document title.
         * @param {String} [url] Location url.
         * @returns {History}
         */
        pushState: function (state, title, url) {
            return this._changeState('push', arguments);
        },

        /**
         * Replaces current state.
         *
         * @param {Object} state New state.
         * @param {String} title Document title.
         * @param {String} [url] Location url.
         * @returns {History}
         */
        replaceState: function (state, title, url) {
            return this._changeState('replace', arguments);
        },

        /**
         * Changes current state.
         *
         * @param {String} method Push or replace method.
         * @param {Array} args Real method params.
         * @returns {History}
         * @protected
         */
        _changeState: function (method, args) {
            history[method + 'State'].apply(history, args);
            this._sensibleUrlFragment = this._getSensibleUrlFragment();
            return this;
        },

        /**
         * Reaction for popstate window event.
         * @protected
         */
        _onPopState: function () {
            var sensibleUrlFragment = this._getSensibleUrlFragment();
            if (this._sensibleUrlFragment !== sensibleUrlFragment) {
                this._sensibleUrlFragment = sensibleUrlFragment;
                this.emit('popsensibleurlfragment', {
                    sensibleUrlFragment: sensibleUrlFragment
                });
            }
        }
    }));

});
