// 2018 MIT licence. testRTC.
// Based on https://gist.github.com/stevebowman/7cff9dd80b227c899728

// Makes a call using Twilio's API.

// Twilio Credentials 
const accountSid = '<YOUR-ACCOUNT-SID-HERE';
const authToken = '<YOUR-AUTH-TOKEN-HERE>';

const fromNumber = '<YOUR-DIAL-FROM-NUMBER>';
const toNumber = '<YOUR-CONTACT-CENTER-PHONE-NUMBER>';

var https = require('https');
var queryString = require('querystring');

// Lambda function:
exports.handler = function (event, context) {

    MakeCall(fromNumber, toNumber,
                function (status) { context.done(null, status); });  
};


// Make a call using the Twilio API
// from: Phone number to dial from
// to: Phone number to dial to
// completedCallback(status) : Callback with status message when the function completes.
function MakeCall(from, to, completedCallback) {

	// Use twimlets to generate our TwiML on the fly.
	var twiml = {
	Twiml:  '<Response>' +
	          '<Pause length="5" />' +
	          '<Play digits="1" />' +
	          '<Pause length="2" />' +
	          '<Play>' +
	            'http://traffic.libsyn.com/effortlessenglish/Sample_learning_guide.mp3' +
	          '</Play>' +
	        '</Response>'
	};
	var url = "http://twimlets.com/echo?" + queryString.stringify(twiml);

    // The SMS message to send
    var message = {
        To: to, 
        From: from,
        Url: url
    };
    
    var messageString = queryString.stringify(message);
    
    // Options and headers for the HTTP request   
    var options = {
        host: 'api.twilio.com',
        port: 443,
        path: '/2010-04-01/Accounts/' + accountSid + '/Calls.json',
        method: 'POST',
        headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(messageString),
                    'Authorization': 'Basic ' + new Buffer(accountSid + ':' + authToken).toString('base64')
                 }
    };
    
    // Setup the HTTP request
    var req = https.request(options, function (res) {

        res.setEncoding('utf-8');
              
        // Collect response data as it comes back.
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });
        
        // Log the responce received from Twilio.
        // Or could use JSON.parse(responseString) here to get at individual properties.
        res.on('end', function () {
            console.log('Twilio Response: ' + responseString);
            completedCallback('API request sent successfully.');
        });
    });
    
    // Handler for HTTP request errors.
    req.on('error', function (e) {
        console.error('HTTP error: ' + e.message);
        completedCallback('API request completed with error(s).');
    });
    
    // Send the HTTP request to the Twilio API.
    // Log the message we are sending to Twilio.
    console.log('Twilio API call: ' + messageString);
    req.write(messageString);
    req.end();
}
