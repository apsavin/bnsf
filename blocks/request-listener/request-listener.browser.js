/**@module request-listener*/
modules.define('request-listener', ['jquery', 'app-navigation'], function (provide, $, navigation, RequestListener) {
    "use strict";

    /**
     * @class RequestListener
     * @extends BEM
     * @exports
     */
    provide(RequestListener.decl(/**@lends RequestListener.prototype*/{

        /**
         * @protected
         */
        _initListener: function () {
            var _this = this;
            $(document).delegate('a', 'click', function (e) {
                if (!e.metaKey && !e.ctrlKey && this.protocol === location.protocol &&
                    this.host === location.host && !this.attributes.target) {
                    e.preventDefault();
                    _this._handleRequest({
                        request: {
                            url: this.pathname + this.search,
                            method: 'GET',
                            headers: {
                                host: location.host
                            }
                        }
                    });
                }
            });
            navigation.on('request', function (e, data) {
                this._handleRequest(data);
            }, this);
        }

    }));

});

