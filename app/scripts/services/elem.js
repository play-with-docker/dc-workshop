'use strict';

angular.module('yapp')
  .factory('elemService', function() {
    var e = {

      onElementReady: function(w, selector) {
        return new Promise((resolve) => {
          var waitForElement = function() {
            var element = w.document.querySelector(selector);
            if (element) {
              resolve(element);
            } else {
              w.requestAnimationFrame(waitForElement);
            }
          };
          waitForElement();
        })
      }
    }

  return e;
});
