const express = require("express");

const app = express.Router();


//get Request Token


app.get('/authorize', (req, res) => {
	var oAuth = new Discogs().oauth();
	oAuth.getRequestToken(
		'JPnbmZabrbkzsewnBGTo', 
		'YMvJquaPiDmyXCiovtaIRxlAOzybHiTfL', 
		'http://localhost:3000/dashboard', 
		function(err, requestData){
            
			// Persist "requestData" here so that the callback handler can 
			// access it later after returning from the authorize url

            const serializedRequestData = JSON.stringify(requestData)
            localStorage.setItem("request", serializedRequestData)

			res.redirect(requestData.authorizeUrl);
		}
	);
});



// get access token

app.get('/callback', (req, res) => {
    let deserializedRequestData = JSON.parse(localStorage.getItem("request"))
	var oAuth = new Discogs(deserializedRequestData).oauth();
	oAuth.getAccessToken(
		req.query.oauth_verifier, // Verification code sent back by Discogs
		function(err, accessData){
			// Persist "accessData" here for following OAuth calls 
            const serializedAccessData = JSON.stringify(accessData)
            localStorage.setItem("access", serializedAccessData)
			res.send('Received access token!');
		}
	);
});


// make the OAuth call

app.get('/identity', (req, res) => {
    let deserializedAccessData = JSON.parse(localStorage.getItem("access"))
	var dis = new Discogs(deserializedAccessData);
	dis.getIdentity(function(err, data){
		res.send(data);
	});
});