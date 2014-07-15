/**@module app-logger*/
modules.define('app-logger', ['logger'], function (provide, Logger) {
    "use strict";
    /**
     * @exports Logger
     */
    provide(new Logger);
});
