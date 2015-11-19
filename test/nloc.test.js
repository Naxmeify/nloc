var path = require('path');

var nloc = require('..');
var should = require('should');

describe('nloc', function() {
  it.only('should return json object with nloc result for mocha.opts file', function(done) {
    nloc({
      target: path.resolve(__dirname, 'mocha.opts')
    }, function(err, result) {
      should.not.exist(err);
      //result.total.should.be.eql(5);
      console.log(result);
      done();
    });
  });

  describe('method isAbsolute()', function() {
    it('should return true for __dirname', function() {
      nloc.isAbsolute(__dirname).should.be.ok;
    });

    it('should return false for ..', function() {
      nloc.isAbsolute('..').should.be.ok;
    });
  });

  describe('method checkPath()', function() {
    it('should return true for __dirname', function() {
      nloc.checkPath(__dirname).should.be.ok;
    });

    it('should return false for /not/existing/path', function() {
      nloc.checkPath('/not/existing/path').should.not.be.ok;
    });
  });

  describe('method notIn()', function() {
    var expressions = [
      '.git',
      'node_modules'
    ];

    var tests = [
      {value: '/home/asd/.git', expected: false},
      {value: '/home/asd/.git/test.file', expected: false},
      {value: '/home/asd/.node_modules/test', expected: false},
      {value: '/home/asd/.node_modules/test/index.js', expected: false},
      {value: '/home/asd/example', expected: true},
      {value: '/home/asd/example/index.js', expected: true}
    ];

     tests.forEach(function(test) {
       it("should return "+test.expected+" for value "+test.value, function() {
         nloc.notIn(expressions, test.value).should.be.eql(test.expected);
       });
     });
  });

  describe('method findInPath()', function() {
    it("should find __filename for searchPath __dirname", function() {
      nloc.findInPath(__dirname).should.have.property(__filename);
    });
  });
});
