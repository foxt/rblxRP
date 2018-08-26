var assert = require('assert');

var pt = require('../index');

describe('parseTable', function() {
  describe('#_getTitles', function() {
    it('should return column titles array', function() {
      assert.deepEqual(
        pt._getTitles('  PID CMD   TIME  '),
        ['PID', 'CMD', 'TIME']
      );
    });
  });

  describe('#_parse', function() {
    it('should return objects with column properties', function() {
      assert.deepEqual(
        pt._parse(' PID  CMD\n  1 abcd  \n20 cdef abc  \n'),
        [{
          PID: '1',
          CMD: 'abcd'
        }, {
          PID: '20',
          CMD: 'cdef abc'
        }]
      );
    });
  });
});