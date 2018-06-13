'use strict';

angular.module('yapp')
  .factory('pwdService', function($http, $location, $rootScope) {
    var p = {

      assignSession: function() {
       return $http.post('https://labs.play-with-docker.com/workshops/4e801834-507c-4100-b471-220b39ce0303/session', {}, {headers: {'Accept': 'application/json'}}).then(function(response) {
            return response.data.session_id;
        });
      },

      getSession: function() {
        var sessionId = $location.path().replace('/','');
        if (!sessionId) {
          return new Promise(function(resolve,reject){reject()});
        }
        return $http.get('https://labs.play-with-docker.com/sessions/' + sessionId).then(function(response) {
          response.data.hostname = 'workshop.play-with-docker.com';
          return response.data;
        });
      },


      init: function(session) {
        // init the pwd session
        return  new Promise(function(resolve, reject) {
          pwd.init(session.id, {baseUrl: 'https://labs.play-with-docker.com'}, function() {
            resolve();
          });
        });
      },

    };

    return p;
  });
