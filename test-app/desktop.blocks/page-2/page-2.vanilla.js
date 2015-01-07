modules.define('page-2', ['i-page'], function (provide, Page) {
    "use strict";

    provide(Page.decl(this.name, {

    }, {

        _title: 'another page'

    }));
});
