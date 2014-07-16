({//todo: remove functions deps after https://github.com/bem/bem-core/issues/532 fix
    mustDeps: [
        {block: 'i-bem', elems: ['dom']}
    ],
    shouldDeps: [
        'functions', 'app-router-base', 'i-page', 'request-listener', 'app-api-requester', 'app-navigation',
        'vow', 'page', 'page-404', 'page-500', {block: 'app-kernel', mods: {'init-auto': true}}, 'app-logger'
    ]
})
