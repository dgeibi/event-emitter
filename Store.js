const forEachRight = require('./forEachRight');

function Store(opts) {
  this.listeners = {};
  this.nextListeners = {};
  this.working = {};
  this.opts = Object.assign({ strict: false, keys: [] }, opts);
}

Store.remove = (x, index, listeners) => {
  if (x.done || x.toRemove) {
    listeners.splice(index, 1);
  }
};

Store.normalize = (listeners) => {
  forEachRight(listeners, Store.remove);
  return listeners;
};

Object.assign(Store.prototype, {
  addListener(key, fn, once, prepend) {
    if (this.opts.strict && !this.opts.keys.includes(key)) {
      throw Error(`${key} is not a built-in key`);
    }

    if (!Array.isArray(this.listeners[key])) {
      this.listeners[key] = [];
    }

    const listener = { fn, once };
    const action = prepend ? 'unshift' : 'push';
    if (this.isActive(key)) {
      if (!this.nextListeners[key]) {
        this.nextListeners[key] = this.listeners[key].slice();
      }
      this.nextListeners[key][action](listener);
    } else {
      this.listeners[key][action](listener);
    }
  },

  syncListeners(key) {
    const active = this.isActive(key);
    const hasNext = Boolean(this.nextListeners[key]);

    if (!active && hasNext) {
      this.listeners[key] = Store.normalize(this.nextListeners[key]);
      this.nextListeners[key] = null;
    } else if (active && hasNext) {
      this.nextListeners[key] = Store.normalize(this.nextListeners[key]);
    } else if (active && !hasNext) {
      this.nextListeners[key] = Store.normalize(this.listeners[key].slice());
    } else {
      this.listeners[key] = Store.normalize(this.listeners[key]);
    }
  },

  isActive(key) {
    return this.working[key] > 0;
  },

  markActive(key) {
    this.working[key] = (this.working[key] || 0) + 1;
  },

  markInActive(key) {
    this.working[key] -= 1;
  },
});

module.exports = Store;
