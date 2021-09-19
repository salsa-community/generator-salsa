const SalsaBaseGenerator = require('../generator-base');
const terminalLink = require('terminal-link');
const { info, warn } = require('prettycli');

module.exports = class extends SalsaBaseGenerator {
  constructor(args, opts) {
    super(args, opts, null);
  }
  prompting() {
    const prompts = [
      {
        type: 'list',
        name: 'appType',
        message: 'Welcome to SALSA CLI?',
        choices: [
          {
            value: 'cvu',
            name: 'Download cvu',
          },
          {
            value: 'rcea',
            name: 'Match Evaluator for a Project',
          },
        ],
        default: 'info',
      },
    ];
    return this.prompt(prompts).then(answers => {
      this.appType = answers.appType;
    });
  }

  default() {
    this.composeWith(require.resolve('../' + this.appType));
  }

  get initializing() {
    return this._initializing();
  }

  _initializing() {
    return {
      displayLogo() {
        this.printLogo();
      },
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      validateJava() {
        this.checkJava();
      },
      validateNode() {
        this.checkNode();
      },
    };
  }
};
