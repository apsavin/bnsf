modules.define('i-page', function (provide) {
    "use strict";

    provide({
        proto: {},
        static: {
            _route: '',

            getRoute: function () {
                return this._route;
            },

            _title: '',

            getTitle: function () {
                return this._title;
            }
        }
    });
});
