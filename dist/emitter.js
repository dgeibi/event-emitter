'use strict';

var forEachRight = function (array, callback) {
  for (var index = array.length - 1; index >= 0; index -= 1) {
    var x = array[index];
    callback(x, index, array);
  }
};

function Store() {
  this.listeners = {};
  this.nextListeners = {};
  this.working = {};
}

Store.sweep = function (item, index, listeners) {
  if (item.done || item.toRemove) {
    listeners.splice(index, 1);
  }
};

Store.normalize = function (listeners) {
  forEachRight(listeners, Store.sweep);
  return listeners;
};

Object.assign(Store.prototype, {
  addListener: function addListener(key, fn, once, prepend) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
      this.working[key] = 0;
    }

    var listener = { fn: fn, once: once };
    var action = prepend ? 'unshift' : 'push';
    if (this.isActive(key)) {
      if (!this.nextListeners[key]) {
        this.nextListeners[key] = this.listeners[key].slice();
      }
      this.nextListeners[key][action](listener);
    } else {
      this.listeners[key][action](listener);
    }
  },

  syncListeners: function syncListeners(key) {
    var active = this.isActive(key);
    var hasNext = Boolean(this.nextListeners[key]);

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

  isActive: function isActive(key) {
    return this.working[key] > 0;
  },

  markActive: function markActive(key) {
    this.working[key] += 1;
  },

  markInActive: function markInActive(key) {
    this.working[key] -= 1;
  },

  getListeners: function getListeners(key) {
    return this.listeners[key];
  },
});

var keysOf = (function () {
  if (Reflect && Reflect.ownKey) {
    return Reflect.ownKey;
  } else if (Object.getOwnPropertySymbols) {
    return function (o) { return Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o)); };
  }
  return Object.getOwnPropertyNames;
})();

/* eslint-disable no-param-reassign */
function EventEmitter() {
  var store = new Store();
  var emitter = {};

  var addListener = function (key, fn, once, prepend) {
    store.addListener(key, fn, once, prepend);
    return emitter;
  };

  var emitAsync = function (key) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var listeners = store.getListeners(key);
    var promise = Promise.resolve(false);
    if (!listeners || !listeners.length) {
      return promise;
    }

    store.markActive(key);
    var reducer = function (promises, listener) { return promises.then(function () {
        if (listener.done || listener.toRemove) { return; }
        listener.done = listener.once;
        return listener.fn.apply(listener, args); // eslint-disable-line consistent-return
      }); };

    return listeners.reduce(reducer, promise).then(function () {
      store.markInActive(key);
      store.syncListeners(key);
      return true;
    });
  };

  var emit = function (key) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var listeners = store.getListeners(key);
    if (!listeners || !listeners.length) {
      return false;
    }

    store.markActive(key);
    listeners.forEach(function (listener) {
      if (listener.done) { return; }
      listener.done = listener.once;
      listener.fn.apply(listener, args);
    });

    store.markInActive(key);
    store.syncListeners(key);
    return true;
  };

  var removeListener = function (key, fn) {
    var listeners = store.getListeners(key);
    if (!listeners || !listeners.length) { return emitter; }
    if (typeof fn !== 'function') {
      throw TypeError('"listener" argument must be a function');
    }
    var toRemove = false;
    for (var index = 0, length = listeners.length; index < length; index += 1) {
      var listener = listeners[index];
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

  var removeAllListeners = function (key) {
    if (key) {
      var listeners = store.getListeners(key);
      if (!listeners || !listeners.length) { return emitter; }
      listeners.forEach(function (x) {
        x.toRemove = true;
      });
      store.syncListeners(key);
      return emitter;
    }
    keysOf(store.listeners).forEach(removeAllListeners);
    return emitter;
  };

  emitter.on = function (key, fn) { return addListener(key, fn, false, false); };
  emitter.once = function (key, fn) { return addListener(key, fn, true, false); };
  emitter.prependListener = function (key, fn) { return addListener(key, fn, false, true); };
  emitter.prependOnceListener = function (key, fn) { return addListener(key, fn, true, true); };
  emitter.addListener = emitter.on;
  emitter.emit = emit;
  emitter.emitAsync = emitAsync;
  emitter.removeListener = removeListener;
  emitter.removeAllListeners = removeAllListeners;
  emitter._store = store; // eslint-disable-line no-underscore-dangle
  return emitter;
}

module.exports = EventEmitter;
