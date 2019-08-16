var Generator = require('yeoman-generator');

const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const {info, warn} = require('prettycli');
const cheerio = require('cheerio');
const $ = cheerio.load('<h2 class="title">Hello world</h2>')
var beautify = require("gulp-beautify");
const fsreader = require('fs');

module.exports = class extends Generator {  
  writing() {
      var yorc = this.destinationPath(".yo-rc.json");
      var yorccontent = this.fs.read(yorc);
      var packageFolder = JSON.parse(yorccontent)["generator-jhipster"].packageFolder;

      var scanDir = this.destinationPath("src/main/resources/config/liquibase/changelog");
      var templateFile = this.templatePath("audit-tables.xml");
      var templateContent = this.fs.read(templateFile);
      fsreader.readdirSync(scanDir).forEach(file => {
          this.fs.copy(this.destinationPath(scanDir+"/"+file), this.destinationPath(scanDir+"/"+file), {
            process: function(content) {
                var regEx = new RegExp('.*jhipster-needle-liquibase-add-column.*', 'g');
                var newContent = content.toString().replace(regEx, templateContent);
                return newContent;
            }
        });
      });

      var excludedFiles = ['package-info.java','AbstractAuditingEntity.java','Authority.java','PersistentAuditEvent.java', 'User.java'];
      scanDir = this.destinationPath("src/main/java/"+packageFolder+"/domain");
      fsreader.readdirSync(scanDir).forEach(file => {
        if(excludedFiles.indexOf(file)==-1){
          this.fs.copy(this.destinationPath(scanDir+"/"+file), this.destinationPath(scanDir+"/"+file), {
            process: function(content) {
                var regEx = new RegExp('implements Serializable', 'g');
                var newContent = content.toString().replace(regEx, 'extends AbstractAuditingEntity implements Serializable');
                return newContent;
            }
        });
        }
      });
  }
};

