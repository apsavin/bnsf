modules.define('cookie-storage', function (provide) {
    "use strict";

    var MemoryCookieStore = require('tough-cookie/lib/memstore').MemoryCookieStore;

    var parseCookie = require('tough-cookie').fromJSON,
        inherits = require('util').inherits,
        noop = function () {
        };

    /**
     * @param {object} session
     * @class SessionCookieStorage
     * @extends MemoryCookieStore
     * @constructor
     */
    var SessionCookieStorage = function (session) {
        MemoryCookieStore.call(this);
        /**
         * @type {Object}
         * @private
         */
        this._session = session;
        this._restore();
    };

    inherits(SessionCookieStorage, MemoryCookieStore);

    /**
     * @private
     */
    SessionCookieStorage.prototype._restore = function () {
        if (!this._session.cookies) {
            this._session.cookies = {};
            return;
        }
        var cookies = this._session.cookies;
        for (var domain in cookies) {
            if (cookies.hasOwnProperty(domain)) {
                this.idx[domain] = {};
                for (var path in cookies[domain]) {
                    if (cookies[domain].hasOwnProperty(path)) {
                        this.idx[domain][path] = {};
                        for (var cookie in cookies[domain][path]) {
                            if (cookies[domain][path].hasOwnProperty(cookie)) {
                                this.idx[domain][path][cookie] = parseCookie(cookies[domain][path][cookie]);
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     * @param {Cookie} cookie
     * @param {function} cb
     */
    SessionCookieStorage.prototype.putCookie = function (cookie, cb) {
        MemoryCookieStore.prototype.putCookie.call(this, cookie, noop);
        var cookies = this._session.cookies;
        if (!cookies[cookie.domain]) {
            cookies[cookie.domain] = {};
        }
        if (!cookies[cookie.domain][cookie.path]) {
            cookies[cookie.domain][cookie.path] = {};
        }
        cookies[cookie.domain][cookie.path][cookie.key] = JSON.stringify(cookie);
        cb(null);
    };

    /**
     * @param {string} domain
     * @param {string} path
     * @param {string} key
     * @param {function} cb
     */
    SessionCookieStorage.prototype.removeCookie = function removeCookie (domain, path, key, cb) {
        MemoryCookieStore.prototype.removeCookie.call(this, domain, path, key, noop);
        var cookies = this._session.cookies;
        if (cookies[domain] && cookies[domain][path] && cookies[domain][path][key]) {
            delete cookies[domain][path][key];
        }
        cb(null);
    };

    /**
     * @param {string} domain
     * @param {string} path
     * @param {function} cb
     */
    SessionCookieStorage.prototype.removeCookies = function removeCookies (domain, path, cb) {
        MemoryCookieStore.prototype.removeCookies.call(this, domain, path, noop);
        var cookies = this._session.cookies;
        if (cookies[domain]) {
            if (path) {
                delete cookies[domain][path];
            } else {
                delete cookies[domain];
            }
        }
        cb(null);
    };

    provide(SessionCookieStorage);

});
