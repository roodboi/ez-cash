import test from 'ava';
import storageFactory from './src/index.js';

const storage = storageFactory('TEST', 'memory');

test('set and get', (t) => {
  const testKey = 'test_1';
  const testValue = 'value_1';

  storage.set(testKey, testValue);

  const storageValue = storage.get(testKey);

  t.is(storageValue.value, testValue);
});

test('set and get and remove', (t) => {
  const testKey = 'test_1';
  const testValue = 'value_1';

  storage.set(testKey, testValue);
  storage.removeItem(testKey);
  const storageValue = storage.get(testKey) || {};

  t.not(storageValue.value, testValue);
});

// get,
// set,
// removeItem,
// clear,

// cachedRequest,
