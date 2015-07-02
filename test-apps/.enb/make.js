var techs = {
        // essential
        fileProvider: require('enb/techs/file-provider'),
        fileMerge: require('enb/techs/file-merge'),

        // optimization
        borschik: require('enb-borschik/techs/borschik'),

        // js
        jsBorschikInclude: require('enb-borschik/techs/js-borschik-include'),
        nodeJsWithSources: require('../../.enb/techs/node-js-with-sources'),
        prependYm: require('enb-modules/techs/prepend-modules'),

        // bemtree
        bemtree: require('../../.enb/techs/bemtree'),

        // bemhtml
        bemhtml: require('enb-bemxjst/techs/bemhtml'),

        // bnsf stuff
        pages: require('../../.enb/techs/pages'),
        pagesBrowser: require('../../.enb/techs/pages-browser'),
        controllers: require('../../.enb/techs/controllers'),
        parameters: require('../../.enb/techs/parameters'),
        routes: require('../../.enb/techs/routes'),
        nodeConfigs: require('../../.enb/techs/node-configs')
    },
    enbBemTechs = require('enb-bem-techs'),
    levels = [
        { path: '../../pre-bem-core.blocks', check: false },
        { path: '../../libs/bem-core/common.blocks', check: false },
        { path: '../../libs/bem-core/desktop.blocks', check: false },
        { path: '../../blocks', check: false },
        { path: '../../dev.blocks', check: false },
        { path: '../../history-api-fallback.blocks', check: false },
        { path: '../../ie-dev.blocks', check: false },
        'blocks'
    ];

module.exports = function (additionalLevels) {
    return function (config) {
        var isProd = process.env.YENV === 'production';

        config.nodes('bundles/*', function (nodeConfig) {
            nodeConfig.addTechs([
                // essential
                [enbBemTechs.levels, { levels: levels.concat(additionalLevels || []) }],
                [enbBemTechs.deps],
                [enbBemTechs.files],
                [techs.fileProvider, { target: '?.bemdecl.js' }],

                // bemtree
                [techs.bemtree, {
                    devMode: process.env.BEMTREE_ENV === 'development',
                    modulesDeps: {
                        'vow': 'Vow',
                        'bemtree-extensions__path': 'path',
                        'bemtree-extensions__redirect': 'redirect'
                    }
                }],

                // bemhtml
                [techs.bemhtml, { devMode: process.env.BEMHTML_ENV === 'development' }],

                // bnsf stuff
                [techs.pages],
                [techs.pagesBrowser],
                [techs.controllers],
                [techs.parameters],
                [techs.fileProvider, { target: '?.routing.yml' }],
                [techs.routes, { source: '?.routing.yml' }],
                [techs.fileProvider, { target: '?.api.routing.yml' }],
                [techs.routes, {
                    source: '?.api.routing.yml',
                    target: '?.routes-private.js',
                    moduleName: 'routes-private'
                }],
                [techs.nodeConfigs],

                // browser js
                [techs.jsBorschikInclude, {
                    target: '?.browser.js',
                    sourceSuffixes: ['vanilla.js', 'js', 'browser.js']
                }],
                [techs.fileMerge, {
                    target: '?.pre.js',
                    sources: ['?.bemhtml.js', '?.bemtree.js', '?.browser.js', '?.pages.js', '?.routes.js']
                }],
                [techs.prependYm, { source: '?.pre.js' }],

                // node js
                [techs.nodeJsWithSources, {
                    target: '?.pre.node.js',
                    sources: [
                        '?.bemhtml.js', '?.bemtree.js',
                        '?.pages.node.js', '?.controllers.node.js',
                        '?.routes.js', '?.routes-private.js',
                        '?.config.node.js'
                    ]
                }],
                [techs.prependYm, { source: '?.pre.node.js', target: '?.node.js' }],

                // borschik
                [techs.borschik, { sourceTarget: '?.js', destTarget: '_?.js', freeze: true, minify: isProd }],
            ]);

            nodeConfig.addTargets(['_?.js', '?.node.js']);
        });
    };
};
