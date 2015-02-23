var environ = require('bem-environ'),
    getTechResolver = environ.getTechResolver,

    BNSF_TECHS = environ.getLibPath('bnsf', '.bem/techs'),
    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.getTechs = function () {
    var techs = {
        'js': 'v2/js-i',
        'bemdecl.js': 'v2/bemdecl.js',
        'deps.js': 'v2/deps.js'
    };

    // use techs from bnsf library
    ['bemtree', 'vanilla.js', 'browser.js', 'node.js'].forEach(getTechResolver(techs, BNSF_TECHS));

    // use techs from bem-core library
    ['bemhtml'].forEach(getTechResolver(techs, BEMCORE_TECHS));

    return techs;
};

exports.defaultTechs = ['vanilla.js', 'bemtree'];
