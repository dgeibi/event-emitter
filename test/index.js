const { expect } = require('chai');
const Emitter = require('..');

const Mock = require('./helper/Mock');

describe('My Emitter', () => {
  it('on', () => {
    const emitter = Emitter();
    const mock = Mock();

    emitter.on('test', mock.fn());

    emitter.emit('test');
    emitter.emit('test');
    expect(mock.count).to.equal(2);
  });

  it('emit returns true if the event had listeners, false otherwise.', () => {
    const emitter = Emitter();
    emitter.on('test', () => {});
    expect(emitter.emit('test')).to.equal(true);
    expect(emitter.emit('xxxx')).to.equal(false);
  });

  it('emitAsync returns a Promise of true if the event had listeners, a Promise of false otherwise.', async () => {
    const emitter = Emitter();
    emitter.on('test', () => {});
    expect(await emitter.emitAsync('test')).to.equal(true);
    expect(await emitter.emitAsync('xxxx')).to.equal(false);
  });

  it('prependListener', () => {
    const emitter = Emitter();
    const mock = Mock();
    let ret = '';

    emitter.on(
      'test',
      mock.fn(() => {
        ret += 'world';
      })
    );
    emitter.prependListener(
      'test',
      mock.fn(() => {
        ret += 'hello ';
      })
    );

    emitter.emit('test');
    expect(ret).to.equal('hello world');
    expect(mock.count).to.equal(2);
  });

  it('once-emit', () => {
    const emitter = Emitter();
    const mock = Mock();

    emitter.once('test', mock.fn());
    emitter.once('test', mock.fn());
    emitter.once('test', mock.fn());
    emitter.emit('test');
    emitter.emit('test');
    expect(mock.count).to.equal(3);
  });

  it('once-emitAsync', async () => {
    const emitter = Emitter();
    const mock = Mock();
    emitter.once('test', mock.fn());
    emitter.once('test', mock.fn());
    emitter.once('test', mock.fn());
    await emitter.emitAsync('test');
    await emitter.emitAsync('test');
    expect(mock.count).to.equal(3);
  });

  it('removeListener', () => {
    const emitter = Emitter();
    const mock = Mock();
    const fn = mock.fn();
    emitter.on('test', fn);
    emitter.on('test', fn);
    emitter.removeListener('test', fn);
    emitter.emit('test');
    expect(mock.count).to.equal(1);
  });

  it('add during emitting', async () => {
    const emitter = Emitter();
    const mock = Mock();
    const fn = mock.fn();
    emitter.on('test', fn);
    emitter.on('test', fn);
    emitter.on('test', () => {
      emitter.on('test', fn);
      emitter.on('test', fn);
    });
    emitter.on('test', fn);
    await emitter.emitAsync('test');
    expect(mock.count).to.equal(3);
    mock.reset();
    emitter.emit('test');
    expect(mock.count).to.equal(5);
  });

  it('rm during emitting', () => {
    const emitter = Emitter();
    const mock = Mock();
    const bmock = Mock();

    const fn = mock.fn();
    emitter.on(
      'test',
      bmock.fn(() => {
        emitter.removeListener('test', fn);
        emitter.removeListener('test', fn);
      })
    );
    emitter.on('test', fn);
    emitter.on('test', fn);

    emitter.emit('test');
    expect(bmock.count).to.equal(1);
    expect(mock.count).to.equal(2);

    mock.reset();
    emitter.emit('test');
    expect(mock.count).to.equal(0);
  });

  it('emitAsync all rm', async () => {
    const emitter = Emitter();
    const a = Mock();
    const b = Mock();

    const fn = a.fn();
    emitter.on(
      'test',
      b.fn(() => {
        emitter.removeListener('test', fn);
        emitter.removeListener('test', fn);
      })
    );
    emitter.on('test', fn);
    emitter.on('test', fn);

    await Promise.all([emitter.emitAsync('test'), emitter.emitAsync('test')]);
    expect(b.count).to.equal(2);
    expect(a.count).to.equal(0);
  });

  it('emitAsync all once', async () => {
    const emitter = Emitter();
    const a = Mock();

    const fn = a.fn();
    emitter.once('test', fn);
    emitter.once('test', fn);

    await Promise.all([emitter.emitAsync('test'), emitter.emitAsync('test')]);
    expect(a.count).to.equal(2);
  });

  it('removeAll', () => {
    const emitter = Emitter();
    const a = Mock();

    const fn = a.fn();
    emitter.once('test', fn);
    emitter.once('x', fn);

    emitter.removeAllListeners();

    emitter.emit('test');
    emitter.emit('x');

    expect(a.count).to.equal(0);
  });

  it('symbol key', () => {
    const emitter = Emitter();
    const symbol = Symbol(1);
    const fn = () => {};
    emitter.on(symbol, fn);
    expect(emitter.emit(symbol)).to.equal(true);
    emitter.removeListener(symbol, fn);
    expect(emitter.emit(symbol)).to.equal(false);
  });
});
