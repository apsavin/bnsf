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
            $(document).on('click', 'a', function (e) {
                if (!e.metaKey && !e.ctrlKey && this.protocol === location.protocol &&
                    this.host === location.host && !this.attributes.target) {
                    e.preventDefault();

                    // we should correct pathname because of IE lte 9
                    var pathname = this.pathname,
                        correctedPathname = pathname && pathname.charAt(0) === '/' ? pathname : '/' + pathname;

                    _this._handleRequest({
                        request: {
                            url: correctedPathname + this.search,
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

