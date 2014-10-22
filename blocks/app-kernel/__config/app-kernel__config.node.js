modules.define('app-kernel__config', ['objects'], function (provide, objects, config) {
    "use strict";

    provide(objects.extend(config, {
        port: 3000,
        staticHost: 'localhost:8080'
    }));

});
