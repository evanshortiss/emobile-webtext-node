/**
 * Main app file.
 */

var qs = require('querystring'),
	request = require('request'),
	constants = require('./constants.js');

// Use cookies
request.defaults({
	jar: true,
	followAllRedirects: true
});


function eMobile() {

};

module.exports = new eMobile();


eMobile.prototype.getLoginCookie = function(callback) {
	request('https://myaccount.emobile.ie/', callback.bind(this));
};

eMobile.prototype.login = function(username, password, callback) {
	if (typeof(username) === 'function') {
		callback = username;
		username = this.username;
		password = this.password;
	}

	var r = request({
		url: constants.LOGIN_URL,
		method: 'POST',
		form: {
			username: username,
			userpass: password,
			login: undefined,
			returnTo: '/'
		},
		headers: {
			"Content-Type": constants.CONTENT_TYPE,
			"User-Agent": constants.AGENT,
			"Referer": 'https://myaccount.emobile.ie/',
			"Origin": 'https://myaccount.emobile.ie',
		}
	}, callback);
};

eMobile.prototype.sendText = function(username, password, text, callback) {
	console.log('send text');

	// First need to get a cookie
	this.getLoginCookie(function(err, res, body) {
		if(err) {
			console.log(err);
			process.exit(0);
		}

		// Required cookies
		var cookies = res.headers['set-cookie'];
		var CFID = cookies[1].split(';')[0].split('=')[1];
		var CFTOKEN = cookies[2].split(';')[0].split('=')[1];

		this.login(username, password, function(err, res, body) {
			if(err) {
				console.log(err);
				process.exit(0);
			}

			// Text Form Data
			// ajaxRequest:sendSMS
			// messageText:test1
			//
			// URL Format for text
			// https://myaccount.emobile.ie/myemobileapi/index.cfm?event=smsAjax&func=sendSMS&CFID=616112&CFTOKEN=83572995
			//
			// Query String Params
			// event:smsAjax
			// func:sendSMS
			// CFID:616112
			// CFTOKEN:83572995

			var qstring = qs.stringify({
				event: 'smsAjax',
				func: 'sendSMS',
				CFID: CFID,
				CFTOKEN: CFTOKEN
			});
			console.log('QUERYSTRING');
			console.log(qstring);

			var opts = {
				uri: 'https://myaccount.emobile.ie/myemobileapi/index.cfm?'+qstring,
				method: 'POST',
				headers: {
					"Accept": '*/*',
					"Content-Type": constants.CONTENT_TYPE,
					"User-Agent": constants.AGENT,
					"Referer:": 'https://myaccount.emobile.ie/go/common/message-centre/web-sms/free-web-text',
					"Origin": 'https://myaccount.emobile.ie',
				},
				form: {
					ajaxRequest: 'sendSMS',
					messageText: 'DUMMY TEXT TEST'
				}
			};

			var r = request(opts, function(err, res, body) {
				if(err && res.stautsCode == 200) {
					console.log(err);
				}

				console.log('=========res==========');
				console.log(res);
				console.log('========= RES END ==========');

				console.log('=========body==========');
				console.log(body);
				console.log('========= BODY END ==========');

				console.log('TEXT SENT');
			});

			console.log('=========req==========');
			console.log(r);
			console.log('========= REQ END ==========');
		});
	});
};



