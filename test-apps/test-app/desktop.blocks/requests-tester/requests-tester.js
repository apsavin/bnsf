/**@module requests-tester*/
modules.define('requests-tester', ['i-bem__dom', 'app-api-requester'], function (provide, BEMDOM, apiRequester) {
    "use strict";

    /**
     * @class RequestsTester
     * @extends BEMDOM
     * @exports
     */
    provide(BEMDOM.decl(this.name, /**@lends RequestsTester#*/{

        /**
         * @private
         */
        _sendRequests: function () {
            // one post request
            apiRequester.post('correct_post', null, {
                response: 'correct_post-1'
            }).then(this._writeResponse, this);

            setTimeout(function () {
                // two post requests in one
                apiRequester.post('correct_post', null, {
                    response: 'correct_post-2'
                }).then(this._writeResponse, this);
                apiRequester.post('correct_post', null, {
                    response: 'correct_post-3'
                }).then(this._writeResponse, this);

                setTimeout(function () {

                    apiRequester.post('error_post', {
                        error: 400
                    }, {
                        response: 'error-post-400'
                    }).fail(this._writeResponse, this);

                    setTimeout(function () {
                        apiRequester.post('error_post', {
                            error: 500
                        }, {
                            response: 'error-post-500'
                        }).fail(this._writeResponse, this);
                    }.bind(this));

                }.bind(this));

            }.bind(this));
        },

        /**
         * @param response
         * @private
         */
        _writeResponse: function (response) {
            this._elem('results-holder').append(response.body);
        }

    }, {
        live: function () {
            this.liveInitOnEvent('button', 'click', function () {
                this._sendRequests();
            });
        }
    }));
});
