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



const link = terminalLink('conacyt', 'https://conacyt-arquitectura.github.io/');

// const spinner = ora(`Loading ${chalk.red('unicorns')}`).start();


module.exports = class extends Generator {  
  writing() {
    fsreader.readdirSync(this.destinationRoot()).forEach(file => {
      var templatePath = this.destinationPath(file);
      console.log(file);
      var audittables = `    
      <column name="created_by" type="varchar(50)">
          <constraints nullable="false"/>
      </column>
      <column name="created_date" type="timestamp"/>
      <column name="last_modified_by" type="varchar(50)"/>
      <column name="last_modified_date" type="timestamp"/>
      <!-- jhipster-needle-liquibase-add-changelog - JHipster will add liquibase changelogs here -->`;
      this.fs.copy(templatePath, templatePath, {
        process: function(content) {
            var regEx = new RegExp('.*jhipster-needle-liquibase-add-changelog.*', 'g');
            var newContent = content.toString().replace(regEx, audittables);
            return newContent;
        }
    });

    });
  }
};

