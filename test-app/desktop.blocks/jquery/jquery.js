/**
 * @module jquery
 * @description Provide jQuery (load if it does not exist).
 */

modules.define('jquery', function (provide, jQuery) {
    // for phantomjs tests
    window.$ = jQuery;
    provide(jQuery);
});
