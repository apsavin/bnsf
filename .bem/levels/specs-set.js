var environ = require('bem-environ'),
    BEMPR_TECHS = environ.getLibPath('bem-pr', 'bem/techs'),
    getTechResolver = environ.getTechResolver;

exports.baseLevelPath = require.resolve('./bundles');

exports.getTechs = function () {
    var techs = this.__base();

    ['spec.js', 'spec.js+browser.js+bemhtml']
        .forEach(getTechResolver(techs, BEMPR_TECHS));

    return techs;
};
