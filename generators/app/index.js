var Generator = require('yeoman-generator');

const ora = require('ora');

const spinner = ora('Loading unicorns').start();

setTimeout(() => {
	spinner.color = 'yellow';
	spinner.text = 'Loading rainbows';
}, 5000);

module.exports = class extends Generator {
    method1() {
      this.log('method 1 just ran');
    }
  
    method2() {
      this.log('method 2 just ran2');
    }
  };