# uemitter

- API like [Node's EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)
- support `emitAsync`
- methods don't rely on `this`

## Install

```
$ npm install uemitter
```

## Usage

``` js
import Emitter from 'uemitter';
// or // const Emitter = require('uemitter');

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
