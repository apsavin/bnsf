modules.define('history', ['inherit', 'events', 'jquery'], function (provide, inherit, events, $) {

    provide(inherit(events.Emitter, {

        __constructor: function () {
            if (history.state === null) {
                history.replaceState(undefined, document.title);
            }
            $(window).on('popstate', this._onPopState.bind(this));
        },

        /**
         * Adds new state to browsing history.
         *
         * @param {Object} state New state.
         * @param {String} title Document title.
         * @param {String} [url] Location url.
         * @returns {Object}
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
         * @returns {Object}
         */
        replaceState: function (state, title, url) {
            return this._changeState('replace', arguments);
        },

        /**
         * Changes current state.
         *
         * @param {String} method Push or replace method.
         * @param {Array} args Real method params.
         * @returns {Object}
         * @private
         */
        _changeState: function (method, args) {
            var state = this.state = args[0];

            try {
                history[method + 'State'].apply(history, args);
            } catch (e) {
                return this.emit('error', { state: state, error: e });
            }

            return this.emit('statechange', { state: state });
        },

        /**
         * Reaction for popstate jQuery event.
         * @param {Event} e
         * @private
         */
        _onPopState: function (e) {
            var state = e.originalEvent.state;
            // ignore initial popstate
            if (state === null) {
                return;
            }
            this.state = state;
            this.emit('statechange', { state: state });
        }
    }));

});
