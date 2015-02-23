/**@module app-kernel*/
modules.define('app-kernel', function (provide, AppKernel) {
    "use strict";

    /**
     * @class AppKernel
     * @extends BEMDOM
     * @exports
     */
    provide(AppKernel.decl(/**@lends AppKernel.prototype*/{

        /**
         * @protected
         */
        _initRequestListener: function () {
            this.__base();
            if (this._requestListener.isNeedToProcessInitialRequest()) {
                this._onRequest(null, this._requestListener.getInitialRequestData());
            }
        }
    }));
});
