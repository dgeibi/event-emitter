class EventEmitter {
  constructor(opts) {
    this.listeners = {};
    this.opts = Object.assign({ strict: false, keys: [] }, opts);
  }

  on(key, fn, once = false) {
    // eslint-disable-next-line no-param-reassign
    key = String(key);
    if (this.opts.strict && !this.opts.keys.includes(key)) {
      throw Error(`${key} is not a built-in key`);
    }
    if (!Array.isArray(this.listeners[key])) {
      this.listeners[key] = [];
    }
    this.listeners[key].push({ fn, once });
    return this;
  }

  once(key, fn) {
    return this.on(key, fn, true);
  }

  emitAsync(key, ...args) {
    const listeners = this.listeners[key];
    const promise = Promise.resolve();
    if (!Array.isArray(listeners)) return promise;
    const reducer = (promises, { fn }) => promises.then(fn.bind(null, ...args));
    this.listeners[key] = listeners.filter(item => !item.once);
    return listeners.reduce(reducer, promise);
  }

  emit(key, ...args) {
    const listeners = this.listeners[key];
    if (!Array.isArray(listeners)) return this;
    listeners.forEach(({ fn }) => fn(...args));
    this.listeners[key] = listeners.filter(item => !item.once);
    return this;
  }

  remove(key, fn) {
    const listeners = this.listeners[key];
    if (!listeners || typeof fn !== 'function') return this;

    const toRemoves = {};
    listeners.forEach((listener, index) => {
      if (listener.fn !== fn) return;
      toRemoves[index] = true;
    });
    this.listeners[key] = listeners.filter((item, index) => !toRemoves[index]);
    return this;
  }
}

module.exports = EventEmitter;
