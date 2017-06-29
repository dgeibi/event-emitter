const assert = require('assert');

const Emitter = require('..');

const Mock = () => ({
  count: 0,

  fn() {
    return this.mockFn.bind(this);
  },

  mockFn() {
    this.count += 1;
  },
});

describe('emitter', () => {
  it('once-emit', () => {
    const emitter = new Emitter();
    const mock = Mock();

    emitter.once('test', mock.fn());
    emitter.once('test', mock.fn());
    emitter.once('test', mock.fn());
    emitter.emit('test');
    emitter.emit('test');
    assert(mock.count === 3);
  });

  it('once-emitAsync', async () => {
    const emitter = new Emitter();
    const mock = Mock();
    emitter.once('test', mock.fn());
    emitter.once('test', mock.fn());
    emitter.once('test', mock.fn());
    await emitter.emitAsync('test');
    await emitter.emitAsync('test');
    assert(mock.count === 3);
  });

  it('remove', () => {
    const emitter = new Emitter();
    const mock = Mock();
    const fn = mock.fn();
    emitter.on('test', fn);
    emitter.on('test', fn);
    emitter.remove('test', fn);
    emitter.emit('test');
    assert(mock.count === 0);
  });

  it('built-in keys', () => {
    const emitter = new Emitter({
      strict: true,
      keys: ['event'],
    });
    const mock = Mock();
    const fn = mock.fn();
    assert.throws(() => {
      emitter.on('test', fn);
    });
    assert.doesNotThrow(() => {
      emitter.on('event', fn);
    });
  });
});
