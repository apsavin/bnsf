modules.define('i-page', ['i-bem'], function (provide, BEM, page) {
    "use strict";

    provide(BEM.decl(this.name, page.proto, page.static));

});
