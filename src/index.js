/* eslint-disable no-param-reassign */
import Store from './Store';
import keysOf from './keysOf';

function EventEmitter() {
  const store = new Store();
  const emitter = {};

  const addListener = (key, fn, once, prepend) => {
    store.addListener(key, fn, once, prepend);
    return emitter;
  };

  const emitAsync = (key, ...args) => {
    const listeners = store.getListeners(key);
    const promise = Promise.resolve(false);
    if (!listeners || !listeners.length) {
      return promise;
    }

    store.markActive(key);
    const reducer = (promises, listener) =>
      promises.then(() => {
        if (listener.done || listener.toRemove) return;
        listener.done = listener.once;
        return listener.fn(...args); // eslint-disable-line consistent-return
      });

    return listeners.reduce(reducer, promise).then(() => {
      store.markInActive(key);
      store.syncListeners(key);
      return true;
    });
  };

  const emit = (key, ...args) => {
    const listeners = store.getListeners(key);
    if (!listeners || !listeners.length) {
      return false;
    }

    store.markActive(key);
    listeners.forEach((listener) => {
      if (listener.done) return;
      listener.done = listener.once;
      listener.fn(...args);
    });

    store.markInActive(key);
    store.syncListeners(key);
    return true;
  };

  const removeListener = (key, fn) => {
    const listeners = store.getListeners(key);
    if (!listeners || !listeners.length) return emitter;
    if (typeof fn !== 'function') {
      throw TypeError('"listener" argument must be a function');
    }
    let toRemove = false;
    for (let index = 0, length = listeners.length; index < length; index += 1) {
      const listener = listeners[index];
      if (!listener.toRemove && listener.fn === fn) {
        listener.toRemove = true;
        toRemove = true;
        break;
      }
    }
    if (toRemove) {
      store.syncListeners(key);
    }
    return emitter;
  };

  const removeAllListeners = (key) => {
    if (key) {
      const listeners = store.getListeners(key);
      if (!listeners || !listeners.length) return emitter;
      listeners.forEach((x) => {
        x.toRemove = true;
      });
      store.syncListeners(key);
      return emitter;
    }
    keysOf(store.listeners).forEach(removeAllListeners);
    return emitter;
  };

  emitter.on = (key, fn) => addListener(key, fn, false, false);
  emitter.once = (key, fn) => addListener(key, fn, true, false);
  emitter.prependListener = (key, fn) => addListener(key, fn, false, true);
  emitter.prependOnceListener = (key, fn) => addListener(key, fn, true, true);
  emitter.addListener = emitter.on;
  emitter.emit = emit;
  emitter.emitAsync = emitAsync;
  emitter.removeListener = removeListener;
  emitter.removeAllListeners = removeAllListeners;
  emitter._store = store; // eslint-disable-line no-underscore-dangle
  return emitter;
}

export default EventEmitter;
