modules.define('app-router-base', [
    'router-base', 'routes'
], function (provide, RouterBase, routes) {
    "use strict";

    provide(new RouterBase({

        routes: routes

    }));
});
