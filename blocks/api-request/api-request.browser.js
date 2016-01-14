/**@module api-request*/
modules.define('api-request', ['inherit'], function (provide, inherit, ApiRequest) {
    "use strict";

    provide(inherit(ApiRequest, {

        /**
         * @param {Object} data
         * @constructs
         */
        __constructor: function (data) {
            this.__base();

            /**
             * @type {Object}
             */
            this.data = data;
        },

        /**
         * @param {*} error
         * @param {XMLHttpRequest} [xhr]
         */
        reject: function (error, xhr) {
            return xhr ? this.__base({
                error: error,
                response: {
                    statusCode: xhr.status,
                    statusText: xhr.statusText
                }
            }) : this.__base(error);
        },

        /**
         * @protected
         */
        _abort: function () {
            this.__base();
            if (!this._request) {
                this.reject(null, {
                    status: 0,
                    statusText: 'abort'
                });
            }
        }
    }));
});
