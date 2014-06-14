/**@module request-listener*/
modules.define('request-listener', ['i-bem'], function (provide, BEM) {
    "use strict";

    /**
     * @class RequestListener
     * @extends BEM
     * @exports
     */
    provide(BEM.decl(this.name, /**@lends RequestListener.prototype*/{

        onSetMod: {
            js: {
                /**
                 * @constructs
                 * @this RequestListener
                 */
                inited: function () {
                    this._initListener();
                }
            }
        },

        /**
         * @protected
         */
        _initListener: function () {

        },

        /**
         * @param data
         * @fires RequestListener#request
         * @protected
         */
        _handleRequest: function (data) {
            /**
             * @event RequestListener#request
             */
            this.emit('request', data);
        }

    }));

});

