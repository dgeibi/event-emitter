class EventEmitter {
  constructor(opts) {
    this.listeners = {};
    this.nextListeners = {};
    this.working = {};
    this.opts = Object.assign({ strict: false, keys: [] }, opts);
    this.addListener = this.on;
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

    if (this.isActive(key)) {
      if (!this.nextListeners[key]) this.nextListeners[key] = this.listeners[key].slice();
      this.nextListeners[key].push({ fn, once });
    } else {
      this.listeners[key].push({ fn, once });
    }
    return this;
  }

  once(key, fn) {
    return this.on(key, fn, true);
  }

  // Unlike emit, with emitAsync you can removeListener dynamically
  emitAsync(key, ...args) {
    this.markActive(key);

    const listeners = this.listeners[key];
    const promise = Promise.resolve();
    if (!Array.isArray(listeners)) return promise;

    const reducer = (promises, listener) =>
      promises.then(() => {
        if (listener.done || listener.toRemove) return;
        listener.done = listener.once; // eslint-disable-line no-param-reassign
        return listener.fn(...args); // eslint-disable-line consistent-return
      });

    return listeners.reduce(reducer, promise).then(() => {
      this.markInActive(key);
      this.syncListeners(key);
    });
  }

  emit(key, ...args) {
    this.markActive(key);

    const listeners = this.listeners[key];
    if (!Array.isArray(listeners)) return this;
    listeners.forEach((listener) => {
      if (listener.done) return;
      listener.done = listener.once; // eslint-disable-line no-param-reassign
      listener.fn(...args);
    });

    this.markInActive(key);
    this.syncListeners(key);
    return this;
  }

  removeListener(key, fn) {
    const listeners = this.listeners[key];
    if (!listeners || typeof fn !== 'function') return this;

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
      this.syncListeners(key);
    }
    return this;
  }

  syncListeners(key) {
    const active = this.isActive(key);
    const listeners = this.nextListeners[key] || this.listeners[key];
    this[active ? 'nextListeners' : 'listeners'][key] = listeners.filter(
      x => !(x.toRemove || x.done)
    );
    if (!active) this.nextListeners[key] = null;
  }

  isActive(key) {
    return this.working[key] > 0;
  }

  markActive(key) {
    this.working[key] = (this.working[key] || 0) + 1;
  }

  markInActive(key) {
    this.working[key] -= 1;
  }
}

module.exports = EventEmitter;
