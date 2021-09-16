class GeneratorError extends Error {
  constructor(title, cause) {
    super(cause);
    this.name = title;
  }
}

module.exports = GeneratorError;
