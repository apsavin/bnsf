/**@module request-listener*/
modules.define('request-listener', function (provide, RequestListener) {
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
            return require('connect')()
                .use(require('body-parser')());
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
            console.log('server started at port ', this.params.port);
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

