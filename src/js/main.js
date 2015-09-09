var angular = require("angular");
require("ngRoute");
require("firebase");
require("angularfire");
require("angular-ui-router");
var CryptographyStrategy = require("./AESCryptographyStrategy.js");

var web2textApp = angular.module('web2text', ["ngRoute", "firebase", 'ui.router']);
var loginId = null;

web2textApp.controller('loginController', function($scope) {
	$scope.login = {
      email:"",
      password:""
    }
    
    $scope.login = function(){
      var rootRef = new Firebase('https://web2text.firebaseio.com/');
      rootRef.authWithPassword($scope.login, function onAuth(error, authData) {
            if (error) {
              console.log("Login Failed!", error);
            } else {
              console.log("Authenticated successfully with payload:", authData);
              loginId = authData.uid;
              window.location = "/#/chatroom";
            }
      });
    }
});

web2textApp.controller('chatroomController', function($scope, $firebaseObject) {
	var rootRef = new Firebase('https://web2text.firebaseio.com/');

  $scope.selected = 0;

    $scope.select= function(index) {
       $scope.selected = index; 
    };

  var user = rootRef.getAuth();
  if(user==null){
    window.location = "/";
  }
  else{
	 var userConversationsRef = rootRef.child(user.uid).child("conversations");

	 var syncObject = $firebaseObject(userConversationsRef);
	 syncObject.$bindTo($scope, "conversations");
  }
});

web2textApp.controller('chatBoxController', function($scope, $firebaseObject, $state, $stateParams) {
  var rootRef = new Firebase('https://web2text.firebaseio.com/');

  var user = rootRef.getAuth();
  if(user==null){
    window.location = "/";
  }
  else{
   var conversationId = $stateParams.contactid;
   $scope.conversationId = conversationId;
   var userConversationsRef = rootRef.child(user.uid).child("conversations").child(conversationId).child("messages");

   var syncObject = $firebaseObject(userConversationsRef);
   syncObject.$bindTo($scope, "messages");
   userConversationsRef.on("child_added", function(data){
      window.setTimeout(function() {
        var elem = document.getElementById('chat');
        elem.scrollTop = elem.scrollHeight;
      }, 200);
   });

   window.setTimeout(function() {
      var elem = document.getElementById('chat');
      elem.scrollTop = elem.scrollHeight;
   }, 200);

   $scope.text = "";

   var cryptographyStrategy = new CryptographyStrategy(rootRef.getAuth().uid);

   $scope.decrypt = function(value){
      return cryptographyStrategy.decrypt(value);//CryptoJS.AES.decrypt(value, rootRef.getAuth().uid).toString(CryptoJS.enc.Utf8);
   }

   $scope.send = function(){
      //var encryptedMessage = CryptoJS.AES.encrypt($scope.text, rootRef.getAuth().uid);
      userConversationsRef.push().set(cryptographyStrategy.encrypt({
        content: $scope.text,
        receiverNumber:conversationId,
        sent_date: Firebase.ServerValue.TIMESTAMP,
        source: "web"
      }));
      $scope.text = "";  
    }
  }
});

web2textApp.config(['$routeProvider', '$stateProvider',
  		function($routeProvider, $stateProvider) {
    		$routeProvider.
      		when('/home', {
        		templateUrl: 'statics/partials/home.html',
        		controller: 'loginController'
      		}).
      		when('/chatroom', {
      			templateUrl: 'statics/partials/chatroom.html',
        		controller: 'chatroomController'
      		}).
      		otherwise({
        		redirectTo: '/home'
      		});

          $stateProvider
            .state('contacts', {
              templateUrl: 'statics/partials/chatBox.html',
              params: {
                contactid: null
              },
              controller: 'chatBoxController'

            });
  	}]);