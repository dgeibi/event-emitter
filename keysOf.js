let fn;
if (Reflect && Reflect.ownKey) {
  fn = Reflect.ownKey;
} else if (Object.getOwnPropertySymbols) {
  fn = o => Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o));
} else {
  fn = Object.getOwnPropertyNames;
}

module.exports = fn;
