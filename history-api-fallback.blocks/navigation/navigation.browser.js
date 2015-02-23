/**@module navigation*/
modules.define('navigation', function (provide, Navigation) {
    "use strict";

    /**
     * @class Navigation
     * @extends BEM
     * @exports
     */
    provide(Navigation.decl(/**@lends Navigation.prototype*/{

        /**
         * @returns {boolean}
         */
        isNeedToProcessInitialRequest: function () {
            return this._history.isNeedToProcessInitialRequest();
        },

        /**
         * @returns {{request: {url: *, isUrlUpdated: boolean, method: string}}}
         */
        getInitialRequestData: function () {
            return this._getRequestByHistoryEventData(this._history.getSensibleUrlFragment());
        }
    }));
});

