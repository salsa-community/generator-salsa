const PrivateBase = require('./generator-base-private');
const chalk = require('chalk');
const packagejs = require('../package.json');
const GENERATOR_SALSA = 'generator-salsa';
const exec = require('child_process').exec;
const semver = require('semver');
/**
 * This is the Generator base class.
 * This provides all the public API methods exposed via the module system.
 * The public API methods can be directly utilized as well using commonJS require.
 *
 * The method signatures in public API should not be changed without a major version change
 */
module.exports = class SalsaBaseGenerator extends PrivateBase {
  constructor(args, options, features) {
    super(args, options, features);
  }

  /**
   * Print an error message.
   *
   * @param {string} msg - message to print
   */
  error(msg) {
    if (this._debug && this._debug.enabled) {
      this._debug(`${chalk.red.bold('ERROR!')} ${msg}`);
    }
    throw new Error(`${msg}`);
  }

  /**
   * Print a warning message.
   *
   * @param {string} msg - message to print
   */
  warning(msg) {
    const warn = `${chalk.yellow.bold('WARNING!')} ${msg}`;
    this.log(warn);
    if (this._debug && this._debug.enabled) {
      this._debug(warn);
    }
  }

  /**
   * Print an info message.
   *
   * @param {string} msg - message to print
   */
  info(msg) {
    this.log.info(msg);
    if (this._debug && this._debug.enabled) {
      this._debug(`${chalk.green('INFO!')} ${msg}`);
    }
  }

  /**
   * Print a success message.
   *
   * @param {string} msg - message to print
   */
  success(msg) {
    this.log.ok(msg);
  }

  checkInvocationFromCLI() {
    if (!this.options.fromCli) {
      this.warning(
        `Deprecated: SALSA seems to be invoked using Yeoman command. Please use the Salsa CLI. Run ${chalk.red(
          'salsa <command>'
        )} instead of ${chalk.red('yo salsa:<command>')}`
      );
    }
  }

  /**
   * Return the user home
   */
  getUserHome() {
    return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
  }

  /**
   * Prints a SALSA logo.
   */
  printLogo() {
    this.log('\n');
    this.log(`${chalk.greenBright('███████╗ █████╗ ██╗     ███████╗ █████╗ ')}`);
    this.log(`${chalk.greenBright('██╔════╝██╔══██╗██║     ██╔════╝██╔══██╗')}`);
    this.log(`${chalk.green('███████╗███████║██║     ███████╗███████║')}`);
    this.log(`${chalk.green('╚════██║██╔══██║██║     ╚════██║██╔══██║')}`);
    this.log(`${chalk.green('███████║██║  ██║███████╗███████║██║  ██║')}`);
    this.log(`${chalk.green('╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝')}`);
    this.log(chalk.white.bold('    https://salsa.crip.conacyt.mx/\n'));
    this.log(chalk.white('Welcome to ') + chalk.green(`salsa `) + chalk.yellow(`v${packagejs.version}`));
    this.log(chalk.white(`Application files will be generated in folder: ${chalk.yellow(process.cwd())}`));
    if (process.cwd() === this.getUserHome()) {
      this.log(chalk.red.bold('\n️⚠️  WARNING ⚠️  You are in your HOME folder!'));
      this.log(chalk.red('This can cause problems, you should always create a new directory and run the salsa command from here.'));
      this.log(chalk.white(`See the troubleshooting section at ${chalk.yellow('https://salsa.crip.conacyt.mx/')}`));
    }
    this.log(
      chalk.green(' _______________________________________________________________________________________________________________\n')
    );
    this.log(chalk.white(`  Documentation for SALSA project ${chalk.yellow('https://salsa.crip.conacyt.mx/')}`));
    this.log(
      chalk.white(`  If you find SALSA useful, consider be part of the project at ${chalk.yellow('https://github.com/salsa-community')}`)
    );
    this.log(
      chalk.green(' _______________________________________________________________________________________________________________\n')
    );
  }
  checkForNewVersion() {
    try {
      const done = this.async();
      shelljs.exec(
        `npm show ${GENERATOR_SALSA} version --fetch-retries 1 --fetch-retry-mintimeout 500 --fetch-retry-maxtimeout 500`,
        { silent: true },
        (code, stdout, stderr) => {
          if (!stderr && semver.lt(packagejs.version, stdout)) {
            this.log(
              `${
                chalk.yellow(' ______________________________________________________________________________\n\n') +
                chalk.yellow('  SALSA update available: ') +
                chalk.green.bold(stdout.replace('\n', '')) +
                chalk.gray(` (current: ${packagejs.version})`)
              }\n`
            );
            this.log(chalk.yellow(`  Run ${chalk.magenta(`npm install -g ${GENERATOR_SALSA}`)} to update.\n`));
            this.log(chalk.yellow(' ______________________________________________________________________________\n'));
          }
          done();
        }
      );
    } catch (err) {
      this.debug('Error:', err);
      // fail silently as this function doesn't affect normal generator flow
    }
  }

  /**
   * Check if Java is installed
   */
  checkJava() {
    if (this.skipChecks || this.skipServer) return;
    const done = this.async();
    exec('java -version', (err, stdout, stderr) => {
      if (err) {
        this.warning('Java is not found on your computer.');
      } else {
        const javaVersion = stderr.match(/(?:java|openjdk) version "(.*)"/)[1];
        if (
          !javaVersion.match(new RegExp('16')) &&
          !javaVersion.match(new RegExp('15')) &&
          !javaVersion.match(new RegExp('14')) &&
          !javaVersion.match(new RegExp('13')) &&
          !javaVersion.match(new RegExp('12')) &&
          !javaVersion.match(new RegExp('11')) &&
          !javaVersion.match(new RegExp('1.8'.replace('.', '\\.')))
        ) {
          this.warning(
            `Java 8, 11, 12, 13, 14, 15 or 16 are not found on your computer. Your Java version is: ${chalk.yellow(javaVersion)}`
          );
        }
      }
      done();
    });
  }
  /**
   * Check if Node is installed
   */
  checkNode() {
    if (this.skipChecks) return;
    const nodeFromPackageJson = packagejs.engines.node;
    if (!semver.satisfies(process.version, nodeFromPackageJson)) {
      this.warning(
        `Your NodeJS version is too old (${process.version}). You should use at least NodeJS ${chalk.bold(nodeFromPackageJson)}`
      );
    }
    if (!(process.release || {}).lts) {
      this.warning(
        'Your Node version is not LTS (Long Term Support), use it at your own risk! SALSA does not support non-LTS releases, so if you encounter a bug, please use a LTS version first.'
      );
    }
  }
};
