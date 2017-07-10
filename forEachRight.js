const forEachRight = (array, callback) => {
  for (let index = array.length - 1; index >= 0; index -= 1) {
    const x = array[index];
    callback(x, index, array);
  }
};

module.exports = forEachRight;
