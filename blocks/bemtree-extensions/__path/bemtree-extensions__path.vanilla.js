/**@module bemtree-extensions__path*/
modules.define('bemtree-extensions__path', ['app-router-base'], function (provide, router) {
    "use strict";
    /**
     * shortcut for bemtree
     * @name path
     * @type {function(this:RouterBase)}
     * @param {string} route
     * @param {object} params
     * @returns {string}
     */
    var path = router.generate.bind(router);
    provide(path);
});
