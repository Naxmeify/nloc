var nloc = require("..");

describe("nloc", function() {
  it("should add 1 to 2 and return 3", function() {
    nloc(1,2).should.be.eql(3);
  });
});
