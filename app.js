/**
 * Main app file.
 */

var qs = require('querystring'),
	request = require('request'),
	constants = require('./constants.js');

var cookies, CFID, CFTOKEN;

// Use cookies
request.defaults({
	jar: true,
	followAllRedirects: true
});


var eMobile = {
	createApiQueryString: function(params) {
		params.CFID = CFID;
		params.CFTOKEN = CFTOKEN;

		return qs.stringify(params);
	},

	getLoginCookie: function(callback) {
		request('https://myaccount.emobile.ie/', callback.bind(this));
	},

	login: function(username, password, callback) {
		if (typeof(username) === 'function') {
			callback = username;
			username = this.username;
			password = this.password;
		}

		request({
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
	},

	sendText: function(recipient, text) {
		this.addRecipient(recipient, function() {
			var opts = {
				uri: constants.EMOBILE_API_URL + createApiQueryString({
					event: 'smsAjax',
					func: 'sendSMS'
				}),
				method: 'POST',
				form: {
					ajaxRequest: 'sendSMS',
					messageText: text
				},
				headers: {
					"Accept": '*/*',
					"Content-Type": constants.CONTENT_TYPE,
					"User-Agent": constants.AGENT,
					"Referer:": 'https://myaccount.emobile.ie/go/common/message-centre/web-sms/free-web-text',
					"Origin": 'https://myaccount.emobile.ie',
				}
			};

			request(opts, function(err, res body) {
				if (err || res.stautsCode != 200) {
					console.log('ERROR SENDING TEXT');
					process.exit(0);
				}
			});
		});
	},

	addRecipient: function(number, callback) {
		var headers: {
			"Accept": '*/*',
			"Content-Type": constants.CONTENT_TYPE,
			"User-Agent": constants.AGENT,
			"Referer:": 'https://myaccount.emobile.ie/go/common/message-centre/web-sms/free-web-text',
			"Origin": 'https://myaccount.emobile.ie',
		}
		var opts = {
			url: constants.EMOBILE_API_URL + createApiQueryString({
				event: 'smsAjax',
				func: 'searchEnteredMsisdn'
			}),
			headers: headers,
			method: 'POST'
			form: {
				ajaxRequest: 'searchEnteredMSISDN'
				searchValue: number
			}
		};

		// This may be uneccessary as it's just a lookup in address book
		request({
			url: constants.EMOBILE_API_URL + createApiQueryString({
				event: 'smsAjax',
				func: 'searchEnteredMsisdn'
			}),
			method: 'POST',
			headers: headers,
			form: {
				ajaxRequest: 'searchEnteredMSISDN'
				searchValue: number
			}
		}, function(err, res, body) {
			if (err || res.stautsCode != 200) {
				console.log(err);
				process.exit(0);
			}

			opts = {
				url: constants.EMOBILE_API_URL + createApiQueryString({
					event: 'smsAjax',
					func: 'addEnteredMsisdns'
				}),
				method: 'POST',
				form: {
					ajaxRequest: 'addEnteredMSISDNs',
					remove: '-',
					add: '0|' + number
				}
			}

			// Now send the text
			request(opts, function(err, res, body) {
				if (err || res.stautsCode != 200) {
					console.log(err);
					process.exit(0);
				}

				callback();
			});
		});
	}
};

module.exports = {
	sendText: function(username, password, text, recipient, callback) {
		console.log('Send message to ' + username);

		eMobile.getLoginCookie(function() {
			eMobile.login(username, password, function() {
				eMobile.sendText(recipient, text);
			})
		});
	},
};


eMobile.prototype.sendText = function(username, password, text, callback) {
	console.log('Send message to ' + username);

	// First need to get a cookie
	this.getLoginCookie(function(err, res, body) {
		if (err) {
			console.log(err);
			process.exit(0);
		}

		// Required cookies
		cookies = res.headers['set-cookie'];
		CFID = cookies[1].split(';')[0].split('=')[1];
		CFTOKEN = cookies[2].split(';')[0].split('=')[1];

		this.login(username, password, function(err, res, body) {
			if (err) {
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
				uri: 'https://myaccount.emobile.ie/myemobileapi/index.cfm?' + qstring,
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

			request(opts, function(err, res, body) {
				if (err || res.stautsCode != 200) {
					console.log(err);
					process.exit(0);
				}

				console.log('TEXT SENT');
			});
		});
	});
};