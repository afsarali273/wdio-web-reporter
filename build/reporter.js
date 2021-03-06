'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _events = require('events');

var _syncRequest = require('sync-request');

var _syncRequest2 = _interopRequireDefault(_syncRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WebReporter extends _events.EventEmitter {
    constructor(baseReporter, config, options = {}) {
        super();
        this.baseReporter = baseReporter;
        this.config = config;
        this.options = options || {};
        this.environment = this.options.environment || [];

        this.runner = {};
        this.results = {};

        this.on('runner:start', function (runner) {
            this.runner = runner;
        });

        this.on('suite:start', function (suite) {
            if (suite.parent === null) {
                // it's a feature
                this.results[suite.specHash] = {
                    title: suite.title,
                    failed: 0,
                    skipped: 0,
                    passed: 0,
                    failures: []
                };
            }
        });

        this.on('test:pending', function (test) {
            this.results[test.specHash].skipped++;
        });

        this.on('test:pass', function (test) {
            this.results[test.specHash].passed++;
        });

        this.on('test:fail', function (test) {
            this.results[test.specHash].failed++;
            this.results[test.specHash].failures.push({
                title: test.title,
                error: test.err.message
            });
        });

        this.on('suite:end', function () {});

        this.on('runner:end', function () {});

        this.on('end', function () {
            let environment = {};
            this.environment.forEach(i => {
                environment[i] = process.env[i];
            });
            if (this.options.url) {
                (0, _syncRequest2.default)('POST', this.options.url, { json: {
                        results: this.results, environment
                    } });
            }
            console.log(this.results); // eslint-disable-line no-console
        });
    }
}

exports.default = WebReporter;
module.exports = exports.default;