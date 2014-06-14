/**@module i-page*/
modules.define('i-page', ['i-bem'], function (provide, BEM, page) {
    "use strict";

    /**
     * @class IPage
     * @extends BEM
     * @exports
     */
    provide(BEM.decl(this.name, page.proto, page.static));

});
