/**@module bemtree-extensions__redirect*/
modules.define('bemtree-extensions__redirect', function (provide) {
    "use strict";
    /**
     * shortcut for bemtree
     * @name redirect
     * @type {function}
     * @param {string} path
     */
    var redirect = function (path) {
        var error = new Error("Redirect needed");
        error.path = path;
        error.redirect = true;
        throw error;
    };
    provide(redirect);
});
