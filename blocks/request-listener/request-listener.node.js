modules.define('request-listener', function (provide, RequestListener) {
    "use strict";

    var http = require('http');

    provide(RequestListener.decl({

        _getMiddleware: function () {
            return require('connect')()
                .use(require('body-parser')());
        },

        _getServerCallback: function () {
            return this._getMiddleware()
                .use(this._onRequest.bind(this));
        },

        _initListener: function () {
            this._server = http.createServer(this._getServerCallback());
            this._server.listen(this.params.port);
            console.log('server started at port ', this.params.port);
        },

        _onRequest: function (req, res) {
            this._handleRequest({
                request: req,
                response: res
            });
        },

        getDefaultParams: function () {
            return {
                port: 3000
            }
        }

    }));

});

