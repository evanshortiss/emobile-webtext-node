/**
 * index.js
 * Main application functions.
 */

var qs = require('querystring'),
  request = require('request'),
  constants = require('./constants.js');

// Use cookies & follow any redirects encountered
request.defaults({
  jar: true,
  followAllRedirects: true
});


function log(str, sameLine) {
  console.log(str);
}

var eMobile = {
  cookies: null,
  CFID: null,
  CFTOKEN: null,


  /**
   * Create the squery string to append to eMobile API calls
   * @params {Object}   params for the query string
   */
  createApiQueryString: function(url, params) {
    params.CFID = this.CFID;
    params.CFTOKEN = this.CFTOKEN;

    return url + qs.stringify(params);
  },


  /**
   * Load the eMobile login page to retreive a cookie.
   * @param {Function}  callback
   */
  getCookie: function(callback) {
    request('https://myaccount.emobile.ie/', callback);
  },


  /**
   * Login to eMobile account.
   * @param {String}    username
   * @param {String}    password
   * @param {Function}  callback
   */
  login: function(username, password, callback) {
    this.getCookie(function(err, res, body) {
      if (err || res.stautsCode === 200) {
        console.log('Error: Failed to retreive login cookie.');
        process.exit(0);
      }

      log('Logging in...', true);
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
          "Referer": constants.REFERER,
          "Origin": constants.ORIGIN,
        }
      }, callback);
    });
  },


  /**
   * Send a text request to the eMobile API
   * @params {String}   recipient
   * @params {String}   text
   * @params {Function} callback
   */
  sendText: function(recipient, text, callback) {
    var self = this;

    this.addRecipient(recipient, function(err) {
      if (err) {
        console.log('Error: Add recipient failed.');
        process.exit(0);
      }

      log('Sending text...', true);
      request({
        uri: self.createApiQueryString(constants.EMOBILE_API_URL, {
          event: 'smsAjax',
          func: 'sendSMS'
        }),
        method: 'POST',
        form: {
          ajaxRequest: 'sendSMS',
          messageText: text
        },
        headers: {
          "Content-Type": constants.CONTENT_TYPE,
          "User-Agent": constants.AGENT,
          "Referer:": constants.SEND_TEXT_REFERER_URL,
          "Origin": constants.ORIGIN,
        }
      }, function(err, res, body) {
        if (err || res.statusCode !== 200) {
          console.log('Error: Text failed to send.');
          process.exit(0);
        }

        log('Text sent successfully!\n')
        if (callback) {
          callback(null);
        }
      });
    });
  },


  /**
   * Add a recipient to the text being sent.
   * @params {String}   number
   * @params {Function} callback
   */
  addRecipient: function(number, callback) {
    var self = this;
    log('Adding recipient ' + number + '...', true);

    request({
      url: self.createApiQueryString(constants.EMOBILE_API_URL, {
        event: 'smsAjax',
        func: 'addEnteredMSISDNs'
      }),
      method: 'POST',
      form: {
        ajaxRequest: 'addEnteredMSISDNs',
        remove: '-',
        add: '0|' + number
      },
      headers: {
        "Content-Type": constants.CONTENT_TYPE,
        "User-Agent": constants.AGENT,
        "Referer:": constants.SEND_TEXT_REFERER_URL,
        "Origin": constants.ORIGIN,
      }
    }, function(err, res, body) {
      if (err || res.statusCode !== 200) {
        callback(true);
      }

      callback(null);
    });
  }
};

module.exports = {
  sendText: function(username, password, text, recipient) {
    // Login before trying to send text 
    eMobile.login(username, password, function(err, res, body) {
      if (err || res.stautsCode === 200) {
        console.log('Error: Login Failed.');
        process.exit(0);
      }

      eMobile.sendText(recipient, text);
    });
  },
};