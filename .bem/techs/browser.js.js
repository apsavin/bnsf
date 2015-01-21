var PATH = require('path'),
    environ = require('bem-environ'),
    fs = require('fs'),
    Vow = require('vow'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'browser.js.js');

exports.techMixin = {
    /**
     * @param {string} initialShift
     * @param {string} shift
     * @returns {string}
     * @protected
     */
    _getPageData: function (initialShift, shift) {
        return this.__base(initialShift, shift) + initialShift + "modules.define('i-bem__dom_init', [pageName], function (provide, _, prev) {\n" +
            initialShift + shift + "provide(prev);\n" +
            initialShift + "});\n";
    },

    /**
     * @returns {Array.<String>}
     */
    getBuildSuffixes: function () {
        return ['js', 'routing.js', 'pages.js'];
    },

    /**
     * Here we check that bemtree output is not newer than browser.js output
     * @param {String} file File which is being built
     * @param {Object[]} files The list of files which will be used.
     * @param {Object} opts Custom options.
     * @return {Promise}
     */
    validate: function (file, files, opts) {
        var bemtreeFilePath = opts.outputName + '.bemtree.js',
            deferred = Vow.defer();
        fs.stat(bemtreeFilePath, function (err, statBemtree) {
            if (err) {
                return deferred.resolve(false);
            }
            fs.stat(file, function (err, statJs) {
                if (err) {
                    return deferred.resolve(false);
                }
                deferred.resolve(statBemtree.mtime < statJs.mtime);
            });
        });
        return Vow.all([deferred.promise(), this.__base(file, files, opts)]).then(function (value) {
            return value[0] && value[1];
        });
    }
};
