/**@module i-page*/
modules.define('i-page', ['i-bem__dom'], function (provide, BEMDOM, page) {
    "use strict";

    /**
     * @class IPage
     * @extends BEM.DOM
     * @exports
     */
    provide(BEMDOM.decl(this.name, page.proto, page.static));

});
