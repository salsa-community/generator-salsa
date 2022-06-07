const path = require('path');
const _ = require('lodash');
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const shelljs = require('shelljs');
const semver = require('semver');

const packagejs = require('../package.json');

/**
 * This is the Generator base private class.
 * This provides all the private API methods used internally.
 * These methods should not be directly utilized using commonJS require,
 *
 */
module.exports = class SalsaBasePrivateGenerator extends Generator {
  constructor(args, options, features) {
    super(args, options, features);
    // expose lodash to templates
    this._ = _;
  }

  /* ======================================================================== */
  /* private methods use within generator (not exposed to modules) */
  /* ======================================================================== */

  /**
   * Override yeoman generator's usage function to fine tune --help message.
   */
  usage() {
    return super.usage().replace('yo salsa:', 'salsa ');
  }
};
