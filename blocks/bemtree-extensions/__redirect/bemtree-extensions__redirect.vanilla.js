/**@module bemtree-extensions__redirect*/
modules.define('bemtree-extensions__redirect', function (provide) {
    "use strict";
    /**
     * shortcut for bemtree
     * @name redirect
     * @type {function}
     * @param {string|number} path or statusCode
     */
    var redirect = function (path) {
        var error = new Error("Redirect needed");
        if (typeof path === 'number') {
            error.response = {statusCode: path};
        } else {
            error.path = path;
            error.redirect = true;
        }

        throw error;
    };
    provide(redirect);
});
