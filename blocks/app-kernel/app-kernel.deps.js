({
    mustDeps: [
        {block: 'i-bem', elems: ['dom']}
    ],
    shouldDeps: [
        'app-router-base', 'i-page', 'request-listener', 'app-api-requester', 'app-navigation',
        'page', 'page-404', 'page-403', 'page-500', {block: 'app-kernel', mods: {'init-auto': true}, elems: ['config']},
        'app-logger', 'app-api-router', 'api-requester', 'objects', 'vow', 'parameters'
    ]
})
