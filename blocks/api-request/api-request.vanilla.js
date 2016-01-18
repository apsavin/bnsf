/**@module api-request*/
modules.define('api-request', ['inherit', 'vow'], function (provide, inherit, Vow) {
    "use strict";

    /**
     * @class ApiRequest
     * @extends Emitter
     */

    var apiRequestPrototype = /**@lends ApiRequest#*/{

        /**
         * @constructs
         */
        __constructor: function () {
            var deferred = Vow.defer();

            /**
             * @type {Promise}
             */
            this._promise = deferred.promise();

            /**
             * @type {Deferred}
             */
            this._deferred = deferred;

            /**
             * @type {boolean}
             * @private
             */
            this._aborted = false;
        },

        /**
         * @public
         */
        abort: function () {
            if (this._aborted) {
                return;
            }
            this._aborted = true;
            this._abort();
        },

        /**
         * @protected
         */
        _abort: function () {
            if (this._request) {
                this._request.abort();
            }
        },

        /**
         * @returns {boolean}
         */
        isAborted: function () {
            return this._aborted;
        },

        /**
         * @param {{abort: Function}} request
         */
        setRequest: function (request) {
            this._request = request;
        }
    };

    Object.keys(Vow.Promise.prototype).forEach(function (methodName) {
        if (methodName.charAt(0) === '_') {
            return;
        }
        apiRequestPrototype[methodName] = function () {
            return this._promise[methodName].apply(this._promise, arguments);
        }
    });

    ['reject', 'resolve'].forEach(function (methodName) {
        apiRequestPrototype[methodName] = function () {
            return this._deferred[methodName].apply(this._deferred, arguments);
        }
    });

    provide(inherit(apiRequestPrototype));
});
