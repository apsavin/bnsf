/* global MAKE:false */

var environ = require('bem-environ');

require(environ.getLibPath('bem-pr', 'bem/nodes'))(MAKE);

MAKE.decl('Arch', {

    blocksLevelsRegexp: /^.+?\.blocks$/,
    bundlesLevelsRegexp: /^.+?\.bundles$/,

    createCustomNodes: function () {
        var SetsNode = MAKE.getNodeClass('SetsNode');

        if (typeof SetsNode.createId === 'undefined') {
            return;
        }

        return new SetsNode({ root: this.root, arch: this.arch }).alterArch();
    }
});

MAKE.decl('SetsNode', {

    getSets: function () {
        return {
            blocks: ['blocks']
        };
    },

    getSourceTechs: function () {
        return ['specs'];
    }
});

MAKE.decl('ExampleNode', {

    getTechs: function () {
        return [
            'bemjson.js',
            'bemdecl.js',
            'deps.js',
            'browser.js',
            'bemhtml',
            'html'
        ];
    }
});

MAKE.decl('SpecNode', {

    getLevels: function () {
        return [
            environ.getLibPath('bem-core', 'common.blocks'),
            'blocks'
        ].concat(environ.getLibPath('bem-pr', 'spec.blocks'));
    },

    getTechs: function () {
        return [
            'bemjson.js',
            'bemdecl.js',
            'deps.js',
            'bemhtml',
            'spec.js+browser.js+bemhtml',
            'css',
            'html',
            'phantomjs'
        ];
    }
});
