modules.define('app-api-router', [
    'router-base', 'routes-private'
], function (provide, RouterBase, routes) {
    "use strict";

    provide(new RouterBase({

        routes: routes

    }));
});
