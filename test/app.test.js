var vows = require('vows'),
    assert = require('assert'),
    bem = require('bem').api,
    spawn = require('child_process').spawn,
    constants = require('./constants'),
    bemServerProcess,
    appServerProcess,
    phantom = {
        phantom: require('phantom')
    },
    client = require('./client');

vows.describe('bnsf-based-app')
    .addBatch({
        start: {
            topic: function () {
                var _this = this,
                    bnsfStarted = false,
                    phantomStarted = false,
                    callbackCalled = false,
                    bemStarted = false;
                bem.make({
                    root: constants.TEST_APP_DIR
                }).then(function () {
                    bemServerProcess = spawn('node', [
                        constants.BEM,
                        'server',
                        '-r',
                        constants.TEST_APP_DIR
                    ]);
                    bemServerProcess.stdout.on('data', function onData (data) {
                        if (/Server is listening/.test(data.toString())) {
                            bemServerProcess.stdout.removeListener('data', onData);
                            if (phantomStarted && bnsfStarted && !callbackCalled) {
                                _this.callback();
                            }
                            bemStarted = true;
                        }
                    });
                    appServerProcess = spawn('node', [
                        constants.APP_SCRIPT
                    ]);
                    appServerProcess.stdout.on('data', function onData (data) {
                        if (/server started/.test(data.toString())) {
                            appServerProcess.stdout.removeListener('data', onData);
                            if (phantomStarted && bemStarted && !callbackCalled) {
                                _this.callback();
                            }
                            bnsfStarted = true;
                        }
                    });
                });
                phantom.phantom.create(function (phantomInstance) {
                    phantom.instance = phantomInstance;
                    phantomInstance.createPage(function (page) {
                        phantom.page = page;
                        if (bnsfStarted && bemStarted && !callbackCalled) {
                            _this.callback();
                        }
                        phantomStarted = true;
                    });
                });
            },

            'should start the servers and phantom': function () {
                assert.equal(appServerProcess && appServerProcess && phantom.page && true, true);
            }
        }
    })
    .addBatch({
        server: require('./server')
    })
    .addBatch({
        client: client.getFirstConfig(phantom)
    })
    .addBatch({
        client: client.getSecondConfig(phantom)
    })
    .addBatch({
        end: {
            'kill the servers': function () {
                phantom.instance.exit();
                appServerProcess.kill();
                bemServerProcess.kill();
            }
        }
    })
    .export(module);
