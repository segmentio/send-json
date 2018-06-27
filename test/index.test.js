'use strict';

var assert = require('proclaim');
var sinon = require('sinon');
var decode = require('base64-decode');
var json = require('json3');
var send = require('../lib');

var protocol = location.protocol;
var hostname = location.hostname;
var port = location.port;
var endpoint = '/base/data';
var url = protocol + '//' + hostname + ':' + port + endpoint;

describe('send-json', function() {
  describe('#json', function() {
    it('should work', function(done) {
      if (send.type !== 'xhr') return done();

      var headers = { 'Content-Type': 'application/json' };
      send.json(url, [1, 2, 3], headers, null, function(err, req) {
        if (err) return done(new Error(err.message));
        var res = json.parse(req.responseText);
        assert(res === true);
        done();
      });
    });

    it('should work with timeout', function(done) {
      if (send.type !== 'xhr') return done();

      var headers = { 'Content-Type': 'application/json' };
      send.json(url, [1, 2, 3], headers, 10 * 1000, function(err, req) {
        if (err) return done(new Error(err.message));
        var res = json.parse(req.responseText);
        assert(res === true);
        done();
      });
    });

    it('should not stringify buffers', function(done) {
      /* global ArrayBuffer, Uint8Array */
      if (typeof ArrayBuffer === 'undefined') return done();

      var xhr = sinon.useFakeXMLHttpRequest();
      var data = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);

      xhr.onCreate = function(req) {
        req.send = function(payload) {
          assert(payload === data);
          done();
        };
      };

      send.json(url, data, {});
    });
  });

  describe('#base64', function() {
    it('should work', function(done) {
      if (send.type !== 'jsonp') return done();

      var url = protocol + '//www.reddit.com/r/pics.json';
      send.callback = 'jsonp';
      send.base64(url, [1, 2, 3], {}, null, function(err, req) {
        if (err) return done(new Error(err.message));
        var data = req.url.split('data=')[1];
        data = decodeURIComponent(data);
        data = json.parse(decode(data));
        assert(data[0] === 1);
        assert(data[1] === 2);
        assert(data[2] === 3);
        assert(req.body.kind === 'Listing');
        done();
      });
    });

    it('should work with timeout', function(done) {
      if (send.type !== 'jsonp') return done();

      var url = protocol + '//www.reddit.com/r/pics.json';
      send.callback = 'jsonp';
      send.base64(url, [1, 2, 3], {}, 10 * 1000, function(err, req) {
        if (err) return done(new Error(err.message));
        var data = req.url.split('data=')[1];
        data = decodeURIComponent(data);
        data = json.parse(decode(data));
        assert(data[0] === 1);
        assert(data[1] === 2);
        assert(data[2] === 3);
        assert(req.body.kind === 'Listing');
        done();
      });
    });
  });
});
