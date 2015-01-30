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
            var bodyParser = require('body-parser');
            return require('connect')()
                .use(bodyParser.urlencoded({ extended: false }))
                .use(bodyParser.json())
                .use(require('express-session')(this._getSessionParams()));
        },

        /**
         * @returns {{name: string, secret: string}}
         * @protected
         */
        _getSessionParams: function () {
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

