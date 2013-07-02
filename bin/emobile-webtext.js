/**
 * Main CLI file.
 */

var eMobile = require('../app.js'),
	constants = require('../constants.js'),
	program = require('commander');

program
	.version(constants.VERSION.toString())
	.option('-u, --number <number>', 'Phone number to login with.', String)
	.option('-p --password <password>', 'Password to login with.', String)
	.option('-a --action <action>', 'Action to do. Default is webtext.', String, 'text')
	.option('-t --text <text>', 'Text to send in a webtext.', String)
	.parse(process.argv);


switch(program.action) {
	case 'text':
		eMobile.sendText(program.number, program.password, program.text);
		break;
	default:
		break;
}