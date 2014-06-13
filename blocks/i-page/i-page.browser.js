modules.define('i-page', ['i-bem__dom'], function (provide, BEMDOM, page) {
    "use strict";

    provide(BEMDOM.decl(this.name, page.proto, page.static));

});
