({//todo: remove functions deps after https://github.com/bem/bem-core/issues/532 fix
    mustDeps: [
        {block: 'i-bem', elems: ['dom']}
    ],
    shouldDeps: [
        'history', 'functions', 'app-router-base', 'i-page', 'request-listener', 'history', 'app-api-requester',
        'vow', 'page', {block: 'app-kernel', mods: {'init-auto': true}}
    ]
})
