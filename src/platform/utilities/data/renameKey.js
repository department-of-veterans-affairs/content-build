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
  return delete Object.assign(obj, { [newKey]: obj[oldKey] })[oldKey];
};

module.exports = renameKey;
