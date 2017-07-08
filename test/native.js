const { expect } = require('chai');
const Emitter = require('events');

const Mock = require('./helper/Mock');

describe('Node.js EventEmitter', () => {
  it('once-emit', () => {
    const emitter = new Emitter();
    const mock = Mock();

    emitter.once('test', mock.fn());
    emitter.once('test', mock.fn());
    emitter.once('test', mock.fn());
    emitter.emit('test');
    emitter.emit('test');
    expect(mock.count).to.equal(3);
  });

  it('removeListener', () => {
    const emitter = new Emitter();
    const mock = Mock();
    const fn = mock.fn();
    emitter.on('test', fn);
    emitter.on('test', fn);
    emitter.removeListener('test', fn);
    emitter.emit('test');
    expect(mock.count).to.equal(1);
  });

  it('add during emitting', () => {
    const emitter = new Emitter();
    const mock = Mock();
    const fn = mock.fn();
    emitter.on('test', fn);
    emitter.on('test', fn);
    emitter.on('test', () => {
      emitter.on('test', fn);
      emitter.on('test', fn);
    });
    emitter.on('test', fn);
    emitter.emit('test');
    expect(mock.count).to.equal(3);
    mock.reset();
    emitter.emit('test');
    expect(mock.count).to.equal(5);
  });

  it('rm during emitting', () => {
    const emitter = new Emitter();
    const mock = Mock();
    const bmock = Mock();

    const fn = mock.fn();
    emitter.on('test', bmock.fn(() => {
      emitter.removeListener('test', fn);
      emitter.removeListener('test', fn);
    }));
    emitter.on('test', fn);
    emitter.on('test', fn);

    emitter.emit('test');
    expect(bmock.count).to.equal(1);
    expect(mock.count).to.equal(2);

    mock.reset();
    emitter.emit('test');
    expect(mock.count).to.equal(0);
  });
});
