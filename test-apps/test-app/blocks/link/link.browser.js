/**@module link*/
modules.define('link', ['i-bem__dom'], function (provide, BEMDOM) {
    "use strict";

    /**
     * @class Link
     * @extends BEMDOM
     * @exports
     */
    provide(BEMDOM.decl(this.name, /**@lends Link#*/{

        onSetMod: {
            js: {
                /**
                 * @constructs
                 * @this Link
                 */
                inited: function () {
                    if (this.params.preventDefault) {
                        this.domElem.on('click', function (e) {
                            e.preventDefault();
                        });
                    }
                }
            }
        }
    }));
});
