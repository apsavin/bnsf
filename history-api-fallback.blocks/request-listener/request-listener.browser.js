/**@module request-listener*/
modules.define('request-listener', ['app-navigation'], function (provide, navigation, RequestListener) {
    "use strict";

    /**
     * @class RequestListener
     * @extends BEM
     * @exports
     */
    provide(RequestListener.decl(/**@lends RequestListener.prototype*/{

        /**
         * @returns {boolean}
         */
        isNeedToProcessInitialRequest: function () {
            return navigation.isNeedToProcessInitialRequest();
        },

        /**
         * @returns {{request: {url: string, isUrlUpdated: boolean, method: string}}}
         */
        getInitialRequestData: function () {
            return navigation.getInitialRequestData();
        }
    }));

});

