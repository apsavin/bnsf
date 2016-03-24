/**@module request-listener*/
modules.define('request-listener', ['app-logger'], function (provide, logger, RequestListener) {
    "use strict";

    var http = require('http');

    /**
     * @class RequestListener
     * @extends BEM
     * @exports
     */
    provide(RequestListener.decl(/**@lends RequestListener.prototype*/{

        /**
         * @returns connect
         * @protected
         */
        _getMiddleware: function () {
            var bodyParser = require('body-parser'),
                session = require('express-session');
            return require('connect')()
                .use(bodyParser.urlencoded({ extended: true }))
                .use(bodyParser.json())
                .use(session(this._getSessionParams(session)));
        },

        /**
         * @param {function} session - 'express-session'
         * @returns {{name: string, secret: string}}
         * @protected
         */
        _getSessionParams: function (session) {
            logger.warn('Redefine RequestListener#_getSessionParams: defaults are not safe.');
            return {
                name: 'sid',
                secret: 'your secret',
                resave: false,
                saveUninitialized: true
            };
        },

        /**
         * @returns connect
         * @private
         */
        _getServerCallback: function () {
            return this._getMiddleware()
                .use(this._onRequest.bind(this));
        },

        /**
         * @protected
         */
        _initListener: function () {
            this._server = http.createServer(this._getServerCallback());
            this._server.listen(this.params.port);
            logger.info('server started at port ', this.params.port);
        },

        /**
         * @param {IncomingMessage} req
         * @param {OutgoingMessage} res
         * @private
         */
        _onRequest: function (req, res) {
            this._handleRequest({
                request: req,
                response: res
            });
        },

        getDefaultParams: function () {
            return {
                port: 3000
            };
        }
    }));
});
