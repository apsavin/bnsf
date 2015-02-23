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

process.on('uncaughtException', function (err) {
    console.log('caught exception: ' + err.stack);
    process.exit(1);
});

['test-app', 'test-app-with-history-fallback'].forEach(function (appName) {
    var paths = constants.getPaths(appName);
    module.exports[appName] = vows.describe(appName)
        .addBatch({
            start: {
                topic: function () {
                    var _this = this,
                        bnsfStarted = false,
                        phantomStarted = false,
                        bemStarted = false;

                    bem.make({
                        root: paths.TEST_APP_DIR
                    }).then(function () {
                        console.log('bem make finished successfully');
                        bemServerProcess = spawn('node', [
                            paths.BEM,
                            'server',
                            '-r',
                            paths.TEST_APP_DIR
                        ]);
                        bemServerProcess.on('error', function (err) {
                            console.log(err);
                            process.exit(1);
                        });
                        bemServerProcess.stderr.on('data', function (data) {
                            console.log('bem server stderr' + data);
                        });
                        bemServerProcess.stdout.on('data', function onData (data) {
                            data = data.toString();
                            console.log(data);
                            if (/Server is listening/.test(data)) {
                                bemServerProcess.stdout.removeListener('data', onData);
                                console.log('bem server started');
                                if (phantomStarted && bnsfStarted) {
                                    _this.callback();
                                }
                                bemStarted = true;
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
                                if (phantomStarted && bemStarted) {
                                    _this.callback();
                                }
                                bnsfStarted = true;
                            }
                        });
                    }, function (err) {
                        console.log(err);
                        process.exit(1);
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
                            if (bnsfStarted && bemStarted) {
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
            end: {
                'kill the servers': function () {
                    phantom.instance.exit();
                    appServerProcess.kill();
                    bemServerProcess.kill();
                }
            }
        });
});


