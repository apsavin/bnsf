/**@module parameters*/
modules.define('parameters', [
    'parameters__files-names', 'parameters__public-names', 'vow', 'objects'
], function (provide, parametersFilesNames, publicNames, vow, objects, parameters) {
    "use strict";

    var yml = require('js-yaml'),
        vowFs = require('vow-fs'),
        path = require('path'),
        mainFileDirectory = path.dirname(require.main.filename),
        promises = parametersFilesNames.map(function (fileName) {
            return vowFs.read(path.join(mainFileDirectory, fileName), 'utf8');
        });

    vow.allResolved(promises)
        .then(function (result) {
            var parameters = result.map(function (promise) {
                return promise.isRejected() ? {} : (yml.safeLoad(promise.valueOf()) || {});
            });

            return objects.extend(parameters[0], parameters[1]);
        }, this)
        .done(function (result) {
            parameters.setParameters(result);

            /**
             * @returns {object}
             */
            parameters.getPublicParameters = function () {
                if (this._publicParameters) {
                    return this._publicParameters;
                }
                var publicParameters = {},
                    key;
                for (var i = 0; i < publicNames.length; i++) {
                    key = publicNames[i];
                    publicParameters[key] = this._parameters[key];
                }
                this._publicParameters = publicParameters;
                return publicParameters;
            };

            provide(parameters);
        });
});
