/* eslint-env node */
/* eslint-disable no-restricted-globals */
'use strict';

module.exports = function(config) {
  config.set({
    files: [
      'test/**/*.test.js'
    ],

    browsers: ['PhantomJS'],

    middleware: ['server'],

    plugins: [
      'karma-*',
      {
        'middleware:server': [
          'factory',
          function() {
            return function(request, response, next) {
              if (request.url === '/base/data' && request.method === 'POST') {
                var body = '';

                response.setHeader('Access-Control-Allow-Origin', '*');

                request.on('data', function(data) {
                  body += data;
                });

                request.on('end', function() {
                  try {
                    var data = JSON.parse(body);
                    response.writeHead(data.length === 3 ? 200 : 400);
                    return response.end(String(data.length === 3));
                  } catch (err) {
                    response.writeHead(500);
                    return response.end();
                  }
                });
              } else {
                next();
              }
            };
          }
        ]
      }
    ],

    frameworks: ['browserify', 'mocha'],

    reporters: ['spec', 'coverage'],

    preprocessors: {
      'test/**/*.js': 'browserify'
    },

    client: {
      mocha: {
        grep: process.env.GREP
      }
    },

    browserify: {
      debug: true,
      transform: [
        [
          'browserify-istanbul',
          {
            instrumenterConfig: {
              embedSource: true
            }
          }
        ]
      ]
    },

    coverageReporter: {
      reporters: [
        { type: 'text' },
        { type: 'html' },
        { type: 'json' }
      ]
    }
  });
};
