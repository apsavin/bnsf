modules.define('i-controller', ['i-bem'], function (provide, BEM) {
    "use strict";

    provide(BEM.decl(this.name, {

        processRequest: function (data) {

        }

    }, {

        _route: '',

        getRoute: function () {
            return this._route;
        }
    }));

});
