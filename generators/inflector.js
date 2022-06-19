'use strict';
const DefaultInflector = require('inflected');
DefaultInflector.inflections('es', function (inflect) {
  inflect.plural(/(o)$/i, '$1s');
  inflect.singular(/(o)s/i, '$1');
  inflect.plural(/(on)$/i, '$1es');
  inflect.singular(/(on)es/i, '$1');
});

module.exports = class Inflector {
  static pluralize(word, locate) {
    return DefaultInflector.pluralize(word, locate);
  }

  static singularize(word, locate) {
    return DefaultInflector.singularize(word, locate);
  }
};
