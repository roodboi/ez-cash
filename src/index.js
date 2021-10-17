const HOUR = 1000 * 60 * 60;

const storageFactory = (storage_key, storage = 'memory') => {
  const checkForStorageSupport = () => {
    if (storage === 'memory') return false;

    try {
      window[storage].setItem('support_test', 'true');
      window[storage].removeItem('support_test');

      return true;
    } catch (e) {
      return false;
    }
  };

  let memoryStorage = {};
  const isStorageSupported = checkForStorageSupport();

  const prefixedKey = (key) => {
    return `${storage_key}_${key}`;
  };

  const checkExpiration = (name) => {
    const existing = _get(name);
    if (!existing || !existing.expiration) {
      return;
    }

    const timeSince = Date.now() - existing.expiration;
    const hasExpired = existing.createdAt < timeSince;

    if (hasExpired) {
      removeItem(name);
    }
  };

  const clear = () => {
    if (isStorageSupported) {
      window[storage].clear();
    } else {
      memoryStorage = {};
    }
  };

  const removeItem = (name) => {
    if (isStorageSupported) {
      window[storage].removeItem(prefixedKey(name));
    } else {
      delete memoryStorage[prefixedKey(name)];
    }
  };

  const _get = (name) => {
    if (isStorageSupported) {
      return JSON.parse(window[storage].getItem(prefixedKey(name)));
    }

    if (memoryStorage.hasOwnProperty(prefixedKey(name))) {
      return memoryStorage[prefixedKey(name)];
    }

    return undefined;
  };

  const get = (name) => {
    checkExpiration(name);

    return _get(name);
  };

  const set = (name, value, expiration = null, bustOnArgs = null) => {
    const valueWithMeta = {
      value,
      createdAt: Date.now(),
      expiration,
      bustOnArgs: bustOnArgs ? JSON.stringify(bustOnArgs) : null,
    };

    if (isStorageSupported) {
      window[storage].setItem(prefixedKey(name), JSON.stringify(valueWithMeta));
    } else {
      memoryStorage[prefixedKey(name)] = valueWithMeta;
    }
  };

  const checkHasNewArguments = (cachedArgs, newArgs) => {
    const newArgsString = newArgs ? JSON.stringify(newArgs) : null;

    return cachedArgs === newArgsString;
  };

  const cachedRequest = async ({
    key,
    request,
    staleTime = HOUR,
    requestArguments = null,
  }) => {
    try {
      const cachedResponse = Storage.get(key);
      const hasNewArgs = cachedResponse
        ? checkHasNewArguments(cachedResponse.bustOnArgs, requestArguments)
        : false;

      if (cachedResponse && !newArgs) {
        return Promise.resolve(cachedResponse);
      }

      const response = await request(requestArguments);
      Storage.set(key, response, staleTime, requestArguments);

      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  return {
    get,
    set,
    removeItem,
    clear,

    cachedRequest,
  };
};

export default storageFactory;
