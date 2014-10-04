/**@module i-page*/
modules.define('i-page', function (provide) {
    "use strict";

    /**
     * @class IPage
     * @exports
     */
    provide({
        proto: {},
        static: {
            _route: '',

            getRoute: function () {
                return this._route || this.getName();
            },

            _title: '',

            getTitle: function () {
                return this._title;
            }
        }
    });
});
