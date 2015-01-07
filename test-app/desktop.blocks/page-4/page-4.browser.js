modules.define('page-4', ['BEMHTML', 'BEMTREE'], function (provide, BEMHTML, BEMTREE, Page4) {
    "use strict";

    provide(Page4.decl({

        update: function (data) {
            return this._replace('code-presenter-with-params', {
                block: 'code-presenter-with-params',
                tech: data.route.parameters.tech
            });
        }

    }));
});
