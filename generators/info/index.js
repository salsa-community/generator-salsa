const Client = require('node-rest-client').Client;
const Generator = require('yeoman-generator');
const terminalLink = require('terminal-link');

const client = new Client();

module.exports = class extends Generator {
  info() {
    client.get('https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=7a486f51c4b14a6ca9701547a223ec20', function (
      data,
      response
    ) {
      data.articles.forEach((element, index) => {
        console.log(terminalLink(++index + ' - ' + element.title, element.url));
      });
    });
    console.log(this.destinationRoot());
  }
};
