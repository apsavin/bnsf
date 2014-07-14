modules.define('app-api-requester', [
    'api-requester'
], function (provide, router, ApiRequester) {
    "use strict";

    provide(new ApiRequester(null, {
        router: router
    }));
});
