modules.define('page-4', ['i-page', 'BEMHTML', 'BEMTREE'], function (provide, Page, BEMHTML, BEMTREE) {
    "use strict";

    provide(Page.decl(this.name, {

        update: function (data) {
            return this._update('code-presenter-with-params', data);
        }

    }));
});
