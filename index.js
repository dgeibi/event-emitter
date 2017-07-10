/* eslint-disable no-param-reassign */
const Store = require('./Store');

function EventEmitter(opts) {
  const store = new Store(opts);
  const emitter = {};

  const addListener = (key, fn, once, prepend) => {
    store.addListener(key, fn, once, prepend);
    return emitter;
  };

  const emitAsync = (key, ...args) => {
    store.markActive(key);

    const listeners = store.listeners[key];
    const promise = Promise.resolve();
    if (!Array.isArray(listeners)) return promise;

    const reducer = (promises, listener) =>
      promises.then(() => {
        if (listener.done || listener.toRemove) return;
        listener.done = listener.once;
        return listener.fn(...args); // eslint-disable-line consistent-return
      });

    return listeners.reduce(reducer, promise).then(() => {
      store.markInActive(key);
      store.syncListeners(key);
    });
  };

  const emit = (key, ...args) => {
    store.markActive(key);

    const listeners = store.listeners[key];
    if (!Array.isArray(listeners)) return emitter;
    listeners.forEach((listener) => {
      if (listener.done) return;
      listener.done = listener.once;
      listener.fn(...args);
    });

    store.markInActive(key);
    store.syncListeners(key);
    return emitter;
  };

  const removeListener = (key, fn) => {
    const listeners = store.listeners[key];
    if (!listeners || typeof fn !== 'function') return emitter;

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
      const listeners = store.listeners[key];
      if (!listeners || !listeners.length) return emitter;
      listeners.forEach((x) => { x.toRemove = true; });
      store.syncListeners(key);
      return emitter;
    }
    Object.keys(store.listeners).forEach(removeAllListeners);
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
  return emitter;
}

EventEmitter.EventEmitter = EventEmitter;

module.exports = EventEmitter;
