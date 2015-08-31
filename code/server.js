var express  = require('express');
var Firebase = require('firebase');
var FirebaseTokenGenerator = require("firebase-token-generator");
var GCM = require('gcm').GCM;
var config = require("./config.js");

var apiKey = config.GCM_API_KEY;
var gcm = new GCM(apiKey);
var app = express();

var port = 1337;

app.listen(port, '0.0.0.0', function(){
	console.log("Server started on port " + port);
});

app.use(express.static('./build/statics'));

app.get('/', function(req, res) {
  res.sendfile('./build/index.html');
});

var tokenGenerator = new FirebaseTokenGenerator(config.FIREBASE_SECRET);
var AUTH_TOKEN = tokenGenerator.createToken({uid: "admin1"},{admin:true});

var ref = new Firebase(config.FIREBASE_URL);
ref.authWithCustomToken(AUTH_TOKEN, function(error, authData) {
	if (error) {
		console.log("Login Failed!", error);
	} else {
		console.log("Login Succeeded!", authData);
		
	}
	registerUserAdded(ref);
});

var registerUserAdded = function(ref){
	ref.on("child_added", function(userList){
		console.log("%j", userList.key());
		registerNewConversationForUser(ref, userList.key());
	});
}

var registerNewConversationForUser = function(ref, userId){
	var userRef = ref.child(userId);
	userRef.child("conversations").on("child_added", function(conversation){
		var conversationRef = userRef.child("conversations").child(conversation.key());
		registerNewMessageForUser(conversationRef, userRef);
	})
}

var registerNewMessageForUser = function(ref, userRef){
	ref.child("messages").orderByChild("sent_date").startAt((new Date).getTime()).on("child_added", function(message){
		console.log("%j", message.val());
		var mes = message.val();
		userRef.child("gcmId").once('value', function(valueSnap){
			mes.registration_id = valueSnap.val();
			var data = {
				registration_id: valueSnap.val(),
				'data.receiverNumber': normalize(mes.receiverNumber),
				'data.content': mes.content,
				'data.source': mes.source
			};
			if(mes.source == "web"){
				gcm.send(data, function(err, messageId){
    				if (err) {
        				console.log("Something has gone wrong!");
    				} else {
        				console.log("Sent with message ID: ", messageId);
    				}
    			});
			}
		});
	});

	}

var normalize = function(value){
	return value.substr(value.length - 10);
}	