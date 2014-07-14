var environ = require('bem-environ'),
    getTechResolver = environ.getTechResolver,

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs'),
    BEMPR_TECHS = environ.getLibPath('bem-pr', 'bem/techs');

exports.getTechs = function () {
    var techs = {
        'js': 'v2/js-i',
        'css': 'v2/css',
        'bemdecl.js': 'v2/bemdecl.js',
        'deps.js': 'v2/deps.js'
    };

    [
        'spec.js',
        'spec.js+browser.js+bemhtml',
        'spec.bemjson.js'
    ].forEach(getTechResolver(techs, BEMPR_TECHS));

    // use techs from bem-core library
    [
        'bemhtml',
        'bemtree',
        'html',
        'vanilla.js',
        'browser.js',
        'node.js',
        'browser.js+bemhtml'
    ].forEach(getTechResolver(techs, BEMCORE_TECHS));

    return techs;
};
