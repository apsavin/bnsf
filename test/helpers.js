var fs = require('fs');

exports.getReplaceCSS = function (CSS) {
    /**
     * creates css with string "1" and removes it when function
     * @param {function} fn will call its callback
     * @returns {function}
     */
    return function (fn) {
        return function () {
            var _this = this;
            fs.writeFile(CSS, '1', function (err) {
                if (err) {
                    console.log(err);
                }
                fn(function () {
                    var args = arguments;
                    fs.unlink(CSS, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        _this.callback.apply(this, args);
                    });
                });
            });
        };
    };
};
