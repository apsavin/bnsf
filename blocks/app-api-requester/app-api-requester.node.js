modules.define('app-api-requester', [
    'app-api-router', 'api-requester'
], function (provide, router, ApiRequester) {
    "use strict";

    provide(new ApiRequester(null, {
        router: router
    }));
});
