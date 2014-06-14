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
         * @param {Object} data
         */
        processRequest: function (data) {

        }

    }, /**@lends IController*/{

        _route: '',

        getRoute: function () {
            return this._route;
        }
    }));

});
