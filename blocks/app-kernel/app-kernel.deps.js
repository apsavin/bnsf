({
    mustDeps: [
        {block: 'i-bem', elems: ['dom']}
    ],
    shouldDeps: [
        'app-router-base', 'i-page', 'request-listener', 'app-api-requester', 'app-navigation',
        'vow', 'page', 'page-404', 'page-500', {block: 'app-kernel', mods: {'init-auto': true}}, 'app-logger'
    ]
})
