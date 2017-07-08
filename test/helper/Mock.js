const Mock = () => ({
  count: 0,

  fn(callback) {
    return () => {
      this.mockFn.call(this);
      if (callback) callback();
    };
  },

  mockFn() {
    this.count += 1;
  },

  reset() {
    this.count = 0;
  },
});

module.exports = Mock;
