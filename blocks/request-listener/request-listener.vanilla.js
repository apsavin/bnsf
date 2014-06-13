modules.define('request-listener', ['i-bem'], function (provide, BEM) {
    "use strict";

    provide(BEM.decl(this.name, {

        onSetMod: {
            js: {
                inited: function (options) {
                    this._initListener();
                }
            }
        },

        _initListener: function () {

        },

        _handleRequest: function (data) {
            this.emit('request', data);
        }

    }));

});

