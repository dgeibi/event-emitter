export default (() => {
  if (Reflect && Reflect.ownKey) {
    return Reflect.ownKey;
  } else if (Object.getOwnPropertySymbols) {
    return o => Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o));
  }
  return Object.getOwnPropertyNames;
})();
