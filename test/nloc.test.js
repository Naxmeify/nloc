var path = require('path');

var nloc = require('..');
var should = require('should');

describe('nloc', function() {
  it('should return json object with nloc result for nloc-testfile.js file', function(done) {
    var target = path.resolve(__dirname, 'nloc-testfile.js');
    nloc({
      target: target
    }, function(err, results) {
      should.not.exist(err);
      results[target].sloc.total.should.be.eql(11);
      done();
    });
  });

  describe('method analyzeFile()', function() {
    it("should analyze the file at given filePath");
  });

  describe('method getFileObj()', function() {
    it("should return a fileObj for the file at given filePath");
  });

  describe('method getLoc()', function() {
    it("should return LOC of the file at given filePath");
  });

  describe('method getEncoding()', function() {
    it("should return encoding of the file at given filePath");
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
