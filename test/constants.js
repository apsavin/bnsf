var path = require('path');

exports.getPaths = function (app) {
    var TEST_APP_DIR = path.resolve(__dirname, '../test-apps/' + app),
        BUNDLE = path.join(TEST_APP_DIR, 'bundles/index');
    return {
        TEST_APP_DIR: TEST_APP_DIR,
        BUNDLE: BUNDLE,
        ENB: path.resolve(__dirname, '../node_modules/.bin/enb'),
        APP_SCRIPT: path.join(BUNDLE, 'index.node'),
        CSS: path.join(BUNDLE, '_index.css')
    };
};


