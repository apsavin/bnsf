modules.define('app-api-requester', [
    'app-router-base', 'api-requester'
], function (provide, router, ApiRequester) {
    "use strict";

    provide(new ApiRequester(null, {
        router: router
    }));
});
