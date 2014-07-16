modules.define('page-500', ['i-page'], function (provide, Page) {
    "use strict";

    provide(Page.decl(this.name, {

    }, {

        _route: this.name,

        _title: 'Server error 500'

    }));
});
