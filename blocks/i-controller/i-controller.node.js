/**@module i-controller*/
modules.define('i-controller', ['i-bem'], function (provide, BEM) {
    "use strict";

    /**
     * @class IController
     * @extends BEM
     * @exports
     */
    provide(BEM.decl(this.name, /**lends IController.prototype*/{

        /**
         * @param {NodeRequestData} data
         */
        processRequest: function (data) {

        },

        /**
         * @param {ServerResponse} response
         * @param {Object} data
         * @param {Number} [statusCode=200]
         * @protected
         */
        _sendJSON: function (response, data, statusCode) {

            data = JSON.stringify(data);

            response.writeHead(statusCode || 200, {
                'Content-Length': Buffer.byteLength(data),
                'Content-Type': 'application/json'
            });
            response.end(data);
        }

    }, /**@lends IController*/{

        _route: '',

        getRoute: function () {
            return this._route;
        }
    }));

});
