modules.define('spec', ['api-requester', 'sinon'], function (provide, ApiRequester, sinon) {
    describe('api-requester', function () {
        it('throws an error on initialization without router', function () {
            var apiRequesterInitialization = function () {
                new ApiRequester();
            };
            apiRequesterInitialization.should.throw('Required parameter router is not found');
        });
    });
    provide();
});
