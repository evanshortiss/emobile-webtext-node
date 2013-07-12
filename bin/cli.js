#!/usr/bin/env node

var eMobile = require('../index.js'),
  program = require('commander');

program
  .option('-u, --number <number>', 'Phone number to login with.', String)
  .option('-r --recipient <recipient>', 'Number to text.', String)
  .option('-t --text <text>', 'Text to send in a webtext.', String)
  .parse(process.argv);


if (program.number && program.text && program.recipient) {
  console.log();
  program.password('Password: ', function(password) {
    console.log();
    eMobile.sendText(program.number, password, program.text, program.recipient);
  });
} else {
  program.help();
}