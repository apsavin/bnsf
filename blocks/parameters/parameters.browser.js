/**@module parameters*/
modules.define('parameters', ['jquery'], function (provide, $, parameters) {
    "use strict";

    parameters.setParameters($(document.body).data('parameters'));

    provide(parameters);
});
