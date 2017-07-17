# event-emitter

- API like [Node's EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)
- support `emitAsync`
- methods don't rely on `this`

## Install

```
$ npm install dgeibi/event-emitter
```

## Usage

``` js
import Emitter from 'event-emitter';
// or // const Emitter = require('event-emitter');

const emitter = Emitter();

// listen to an event
emitter.once('foo', async () => {
  const data = await fetch('example.com/foo.json').then(res => res.json());
  // do something with data
});

(async () => {
  // emit an event
  await emitter.emitAsync('foo');
})();
```
