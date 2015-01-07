var path = require('path'),
    TEST_APP_DIR = exports.TEST_APP_DIR = path.resolve(__dirname, '../test-app'),
    BUNDLE = exports.BUNDLE = path.join(TEST_APP_DIR, 'desktop.bundles/index');

exports.BEM = path.resolve(TEST_APP_DIR, '../node_modules/.bin/bem');
exports.APP_SCRIPT = path.join(BUNDLE, 'index.node');
exports.CSS = path.join(BUNDLE, '_index.css');
