/**
 * node-js-with-sources
 * =======
 *
 * Collects *vanilla.js* and *node.js*-files by deps using `require`, saves as `?.node.js`.
 *
 * **Options**
 *
 * * *String* **target** - `?.node.js` by default.
 * * *String* **filesTarget** — `?.files` by default.
 *
 * **Example**
 *
 * ```javascript
 * nodeConfig.addTech(require('path/to/node-js-with-sources'));
 * ```
 */
module.exports = require('enb').buildFlow.create()
    .name('node-js-with-sources')
    .target('target', '?.node.js')
    .useFileList(['vanilla.js', 'node.js'])
    .defineOption('before')
    .useSourceListFilenames('before')
    .defineOption('after')
    .useSourceListFilenames('after')
    .builder(function (sourceFiles, before, after) {
        var getSourceFileDescription = function (name) {
            return {
                fullname: name
            };
        };

        if (before) {
            Array.prototype.unshift.apply(sourceFiles, before.map(getSourceFileDescription));
        }

        if (after) {
            Array.prototype.push.apply(sourceFiles, after.map(getSourceFileDescription));
        }

        var node = this.node,
            dropRequireCacheFunc = [
                'function dropRequireCache(requireFunc, filename) {',
                '    var module = requireFunc.cache[filename];',
                '    if (module) {',
                '        if (module.parent) {',
                '            if (module.parent.children) {',
                '                var moduleIndex = module.parent.children.indexOf(module);',
                '                if (moduleIndex !== -1) {',
                '                    module.parent.children.splice(moduleIndex, 1);',
                '                }',
                '            }',
                '            delete module.parent;',
                '        }',
                '        delete module.children;',
                '        delete requireFunc.cache[filename];',
                '    }',
                '};'
            ].join('\n');

        return [
            dropRequireCacheFunc,
            sourceFiles.map(function (file) {
                var relPath = node.relativePath(file.fullname);

                return [
                    'dropRequireCache(require, require.resolve("' + relPath + '"));',
                    'require("' + relPath + '")'
                ].join('\n');
            }).join('\n')
        ].join('\n');
    })
    .createTech();
