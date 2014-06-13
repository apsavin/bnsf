modules.define('app-api-requester', [
    'api-requester'
], function (provide, ApiRequester) {
    "use strict";

    provide(new ApiRequester());
});
