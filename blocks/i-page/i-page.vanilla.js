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

            /**
             * @protected
             */
            _route: '',

            /**
             * @returns {string}
             */
            getRoute: function () {
                return this._route || this.getName();
            }
        }
    });
});
