/**
 * Given an object, you can rename a particular key with a new key.
 *
 *
 * @param {Object} object
 * @param {String} oldKey
 * @param {String} newKey
 */

const renameKey = (obj, oldKey, newKey) => {
  if (!obj) return null;

  if (typeof oldKey !== 'string' || typeof newKey !== 'string') {
    throw new Error('oldKey and newKey are required. Must be type of string');
  }

  return delete Object.assign(obj, { [newKey]: obj[oldKey] })[oldKey];
};

module.exports = renameKey;
