# Conacyt code generator

## Development configuration

#### Install dependencies

`npm install`

#### Install globally for test purpose

`npm link`

#### run default command

`yo conacyt`

## Common snippets

### Use of the spinner

Four more information, visit [Spinner](https://github.com/sindresorhus/ora)


```js
const ora = require('ora');

const spinner = ora('cargando cvus').start();
spinner.succeed('Downloaded ' + row.cvu);
spinner.

```
### User interations

For user interactions, visit [User Interactions spec](https://yeoman.io/authoring/user-interactions.html)

For more information, visit [Inquirer](https://github.com/SBoudrias/Inquirer.js#prompt)

For examples, visit [Inquirer Examples](https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer/examples)

Example:

```js
async prompting() {
    this.answers = await this.prompt([
        {
            type: "input",
            name: "username",
            message: "what is your username",
            default: this.appname // Default to current folder name
        },
        {
            type: "confirm",
            name: "isRoot",
            message: "Are your root of the service?"
        },
        {
            type: "list",
            name: "reports",
            message: "select the type of report?",
            choices: [
                'Simple',
                'Ejecutivo',
                new inquirer.Separator(),
                'Completo',
                {
                    name: 'Contact support',
                    disabled: 'Unavailable at this time'
                },
                'Ninguno'
            ],
            filter: function (val) {
                return val.toLowerCase();
            }
        },
        {
            type: "rawlist",
            name: "protocol",
            message: "what kind of protocol do you want to use",
            choices: ["http", "https", "ftp"]
        },
        {
            type: "expand",
            name: "overwrite",
            message: "would you like to overwrite the existing file?",
            default: 'y',
            expanded: true,
            choices: [
                {
                    key: 'y',
                    name: 'Overwrite',
                    value: 'overwrite'
                },
                {
                    key: 'a',
                    name: 'Overwrite this one and all next',
                    value: 'overwrite_all'
                },
                {
                    key: 'd',
                    name: 'Show diff',
                    value: 'diff'
                },
                {
                    key: 'x',
                    name: 'Abort',
                    value: 'abort'
                }
            ]
        },
        {
            type: "checkbox",
            name: "manager",
            message: "Select a package manager",
            choices: [
                { name: 'npm', value: 'npm' },
                { name: 'yarn', value: 'yarn' },
                { name: 'jspm', value: 'jspm', disabled: true }
            ]
        },
        {
            type: "number",
            name: "is",
            message: "",
            choices: [
                { name: 'npm', value: 'npm' },
                { name: 'yarn', value: 'yarn' },
                { name: 'jspm', value: 'jspm', disabled: true }
            ]
        },
        {
            type: "password",
            name: "password",
            message: "Enter your password",
            mask: '*'
        },
        {
            type: "editor",
            name: "resume",
            message: "Please write a short bio of at least 3 lines."
        }


    ]);
}
```

#### References

[kikobeats](https://github.com/Kikobeats/awesome-cli)