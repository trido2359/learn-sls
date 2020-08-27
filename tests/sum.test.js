const { sum } = require('../libs/sum-lib');

test("equal to 5", () => {
    const a = 1, b = 4, c = 5;
    const expectedSum = sum(a,b);
  
    expect(c).toEqual(expectedSum);
  });