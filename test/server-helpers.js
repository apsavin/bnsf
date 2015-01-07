var request = require('request'),
    memoize = require('lodash.memoize'),
    assert = require('assert'),
    server = {
        get: function (path) {
            return function () {
                request('http://localhost:3000' + path, this.callback);
            };
        }
    },
    assertStatus = memoize(function (status) {
        return function (res) {
            assert.equal(res.statusCode, status);
        };
    }),
    assertTitle = memoize(function (title) {
        return function (err, res, body) {
            assert.match(body, new RegExp('<title>' + title + '</title>', 'g'));
        };
    }),
    assertContent = memoize(function (content) {
        return function (err, res, body) {
            assert.match(body, new RegExp(content, 'g'));
        };
    });

/**
 * @param {Array.<{params: Array, topic: function, config: object}|Array>} pages
 * @param {Array.<string>} pages.params - path, status, title, [content]
 * @returns {object} vows config
 */
exports.checkPages = function (pages) {
    return pages.reduce(function (configs, page) {
        var config = page.config || {},
            params = page.params || page;
        config.topic = page.topic || server.get(params[0]);
        config['should respond with status ' + params[1]] = assertStatus(params[1]);
        config['should contain title "' + params[2] + '"'] = assertTitle(params[2]);
        if (page[3]) {
            config['should contain content "' + params[3] + '"'] = assertContent(params[3]);
        }
        configs['request to ' + params[0]] = config;
        return configs;
    }, {});
};
