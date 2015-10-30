'use strict';

angular.module('clientApp')
  .controller('NavCtrl', function ($scope, $location) {
    $scope.active_tools =[];

    $scope.isActive = function (viewLocation) {
       return viewLocation === $location.path();
   };

   var set_active_tool_list = function(data){
       $scope.active_tools = data;
   }

   socket.on('set_tool_list',function(data){
     $scope.$apply(function(){
       set_active_tool_list(data);
     })
   });
  });
