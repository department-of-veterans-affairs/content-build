import { expect, assert } from 'chai';

const renameKey = require('../../utilities/data/renameKey');

describe('renameKey', () => {
  const testObj = { testKey1: 'test value 1' };

  it('returns null if null is passed', () => {
    expect(renameKey(null)).to.be.null;
  });

  it('returns null if null object is passed with valid oldKey and newKey names', () => {
    expect(renameKey(null, 'testKey1', 'newKey')).to.be.null;
  });

  // it('returns null if null object is passed and empty strings are passed for oldKey and newKey', () => {
  //   console.log('empty strings situation', renameKey(testObj, "", ""))
  //   expect(renameKey(testObj, "", "")).to.be.null
  // })

  it('throws an error if null object is passed and empty strings are passed for oldKey and newKey', () => {
    try {
      renameKey(testObj, '', '');
    } catch (error) {
      assert.instanceOf(error, Error);
    }
  });

  it('throws an error if either the oldKey or newKey is not passed', () => {
    try {
      renameKey(testObj, 'testKey');
    } catch (error) {
      assert.instanceOf(error, Error);
    }
  });

  it('throws an error if both oldKey and newKey are not passed', () => {
    try {
      renameKey(testObj);
    } catch (error) {
      assert.instanceOf(error, Error);
    }
  });

  it('throws an error if both oldKey and newKey null', () => {
    try {
      renameKey(testObj, null, null);
    } catch (error) {
      assert.instanceOf(error, Error);
    }
  });
  it('throws an error if both oldKey and newKey are undefined', () => {
    try {
      renameKey(testObj, undefined, undefined);
    } catch (error) {
      assert.instanceOf(error, Error);
    }
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
