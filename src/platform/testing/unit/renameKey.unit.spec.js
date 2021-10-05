import { expect } from 'chai';

const renameKey = require('../../utilities/data/renameKey');

describe('renameKey', () => {
  it('returns null if null is passed', () => {
    expect(renameKey(null, 'testKey1', 'newKey')).to.be.null;
  });

  it('renames a particular key within an object', () => {
    const testData = {
      testKey1: 'test value 1',
      testKey2: 'test value 2',
      testKey3: 'test value 3',
    };

    const expected = {
      testKey2: 'test value 2',
      testKey3: 'test value 3',
      newKey: 'test value 1',
    };

    renameKey(testData, 'testKey1', 'newKey');
    expect(testData).to.deep.eq(expected);
  });
});
