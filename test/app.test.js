var vows = require('vows'),
    assert = require('assert'),
    spawn = require('child_process').spawn,
    constants = require('./constants'),
    phantom = {
        phantom: require('phantom')
    },
    client = require('./client'),
    testServer = require('../test-apps/test-server/test-server').server;

process.on('uncaughtException', function (err) {
    console.log('caught exception: ' + err.stack);
    process.exit(1);
});

[
    'test-app',
    'test-app-with-history-fallback',
    'test-app-with-wrapper'
].forEach(function (appName) {
        var enbMakeProcess,
            enbServerProcess,
            appServerProcess,
            paths = constants.getPaths(appName);
        module.exports[appName] = vows.describe(appName)
            .addBatch({
                start: {
                    topic: function () {
                        var _this = this,
                            bnsfStarted = false,
                            phantomStarted = false,
                            enbServerStarted = false;

                        enbMakeProcess = spawn('node', [
                            paths.ENB,
                            'make'
                        ], {
                            cwd: paths.TEST_APP_DIR
                        });
                        enbMakeProcess.on('close', function (code) {
                            if (code !== 0) {
                                console.log('enb make process exited with code ' + code);
                                process.exit(1);
                                return;
                            }
                            console.log('enb make finished successfully');
                            enbServerProcess = spawn('node', [
                                paths.ENB,
                                'server'
                            ], {
                                cwd: paths.TEST_APP_DIR
                            });
                            enbServerProcess.on('error', function (err) {
                                console.log(err);
                                process.exit(1);
                            });
                            enbServerProcess.stderr.on('data', function (data) {
                                console.log('enb server stderr' + data);
                            });
                            enbServerProcess.stdout.on('data', function onData (data) {
                                data = data.toString();
                                console.log(data);
                                if (/Server started/.test(data)) {
                                    enbServerProcess.stdout.removeListener('data', onData);
                                    if (phantomStarted && bnsfStarted) {
                                        _this.callback();
                                    }
                                    enbServerStarted = true;
                                }
                            });
                            appServerProcess = spawn('node', [
                                paths.APP_SCRIPT
                            ]);
                            appServerProcess.on('error', function (err) {
                                console.log(err);
                                process.exit(1);
                            });
                            appServerProcess.stderr.on('data', function (data) {
                                console.log('app server stderr' + data);
                            });
                            appServerProcess.stdout.on('data', function onData (data) {
                                data = data.toString();
                                console.log(data);
                                if (/server started/.test(data)) {
                                    console.log('app server started');
                                    appServerProcess.stdout.removeListener('data', onData);
                                    if (phantomStarted && enbServerStarted) {
                                        _this.callback();
                                    }
                                    bnsfStarted = true;
                                }
                            });
                        });
                        enbMakeProcess.stderr.on('data', function (data) {
                            console.log('enb make stderr ' + data);
                        });

                        phantom.phantom.create({
                            onStderr: console.log.bind(console),
                            onStdout: console.log.bind(console)
                        }, function (phantomInstance) {
                            phantom.instance = phantomInstance;
                            console.log('phantom instance created');
                            phantomInstance.createPage(function (page) {
                                phantom.page = page;
                                console.log('phantom started');
                                page.onConsoleMessage(function (msg) {console.log('PHANTOM ' + msg); });
                                if (bnsfStarted && enbServerStarted) {
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
                server: require('./server').getConfig(paths)
            })
            .addBatch({
                client: client.getFirstConfig(paths, phantom)
            })
            .addBatch({
                client: client.getSecondConfig(paths, phantom)
            })
            .addBatch({
                client: client.getThirdConfig(paths, phantom)
            })
            .addBatch({
                client: client.getFourthConfig(paths, phantom)
            })
            .addBatch({
                end: {
                    'kill the servers': function () {
                        phantom.instance.exit();
                        appServerProcess.kill();
                        enbServerProcess.kill();
                    }
                }
            });
    });

module.exports['cleanup'] = vows.describe('cleanup').addBatch({
    'test server': {
        kill: function () {
            testServer.close();
        }
    }
});
