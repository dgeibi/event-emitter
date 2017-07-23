import forEachRight from './forEachRight';

function Store() {
  this.listeners = {};
  this.nextListeners = {};
  this.working = {};
}

Store.sweep = (item, index, listeners) => {
  if (item.done || item.toRemove) {
    listeners.splice(index, 1);
  }
};

Store.normalize = (listeners) => {
  forEachRight(listeners, Store.sweep);
  return listeners;
};

Object.assign(Store.prototype, {
  addListener(key, fn, once, prepend) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
      this.working[key] = 0;
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
    this.working[key] += 1;
  },

  markInActive(key) {
    this.working[key] -= 1;
  },

  getListeners(key) {
    return this.listeners[key];
  },
});

export default Store;
