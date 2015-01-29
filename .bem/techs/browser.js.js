var PATH = require('path'),
    environ = require('bem-environ'),
    fs = require('fs'),
    Vow = require('vow'),

    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs');

exports.baseTechPath = PATH.resolve(BEMCORE_TECHS, 'browser.js.js');

var fileStat = function (path) {
    var deferred = Vow.defer();
    fs.stat(path, function (err, stat) {
        if (err) {
            return deferred.resolve(false);
        }
        deferred.resolve(stat);
    });
    return deferred.promise();
};

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
     * Here we check that bemtree and bemhtml output is not newer than browser.js output
     * @param {String} file File which is being built
     * @param {Object[]} files The list of files which will be used.
     * @param {Object} opts Custom options.
     * @return {Promise}
     */
    validate: function (file, files, opts) {
        var bemhtmlPath = opts.outputName + '.bemtree.js',
            bemtreePath = opts.outputName + '.bemhtml.js',
            stats = [file, bemtreePath, bemhtmlPath].map(fileStat),
            isNewerThanBemhtmlAndBemtree = Vow.all(stats).then(function (value) {
                return value[0] && value[1] && value[2] && // no errors
                    value[0].mtime > value[1].mtime && // newer than bemtree
                    value[0].mtime > value[2].mtime; // newer than bemhtml
            });
        return Vow.all([isNewerThanBemhtmlAndBemtree, this.__base(file, files, opts)]).then(function (value) {
            return value[0] && value[1];
        });
    }
};
