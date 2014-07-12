modules.define('page-404', ['i-page'], function (provide, Page) {
    "use strict";

    provide(Page.decl(this.name, {

    }, {

        _route: this.name,

        _title: '404 not found'

    }));
});
