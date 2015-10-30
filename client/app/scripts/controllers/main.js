'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('MainCtrl', function ($scope,$routeParams) {
    $scope.active_users=[];
    $scope.crashed_instances =[];
    $scope.live_feed = [];
    $scope.selectedTool = $routeParams.toolname;

    $scope.default_user = {session_id:-1};
    $scope.selected_user = $scope.default_user;
    $scope.showActiveToolName = function(){
      alert($scope.selectedTool);
    }
    $scope.IsSelected=function(active_user){
      return $scope.selected_user==active_user;
    }
    $scope.clicked_active_user= function(active_user){
      if(active_user==$scope.selected_user)
          $scope.selected_user =$scope.default_user;
      else
          $scope.selected_user=active_user;
      console.log("--------------------" + $scope.selected_user.session_id);
    };
    $scope.IsSelectedTool = function( ) {
      return function( item ) {
        if($scope.selectedTool=="all")
          return true;
        return item.tool ==$scope.selectedTool;
      };
    };

    $scope.IsSelectedSession = function( ) {
      return function( item ) {
        return item.session_id ==  $scope.selected_user.session_id||
        $scope.selected_user.session_id==-1;
      };
    };

    $scope.GetSelectedSession = function(){
       if($scope.selected_user.session_id==-1){
         return "All sessions";
       }
       return  $scope.selected_user.session_id;
    }

    $scope.getActiveInstance = function(){
      var active_instances=0;
      if($scope.selectedTool=="all")
        return  $scope.active_users.length;
      for(var index = 0 ;index<$scope.active_users.length;index++){
          if($scope.active_users[index].tool == $scope.selectedTool)
            active_instances++;
      }
      return active_instances;
    }

    $scope.getCrashedInstance = function(){
      var count=0;
      if($scope.selectedTool=="all")
        return  $scope.crashed_instances.length;
      for(var index = 0 ;index<$scope.crashed_instances.length;index++){
          if($scope.crashed_instances[index].tool == $scope.selectedTool)
            count++;
      }
      return count;
    }
    $scope.submitCommand =function(_command,_session_id){
      if(_command){
        var data = {
          command     : _command,
          session_id  : _session_id
        }
        socket.emit('command',data);
      }
    }

    var set_active_user = function(activeuserlist){
        $scope.active_instances = activeuserlist.length;
        $scope.active_users=activeuserlist;
    }
    var add_log = function(log_data){
      var is_error= log_data.msg.match(/error/i);
      var image_name = "3.png";
      if(is_error)
          image_name ="1.png";

      var feed ={ image_path  : "images/"+image_name,
                  timestamp   : moment().format('h:mm:ss:a'),
                  msg         : log_data.msg,
                  username    : log_data.username,
                  session_id  : log_data.session_id};
      $scope.live_feed.push(feed);
    }

     socket.on('list_active_users',function(activeuserlist){
       // $scope.$apply more details @
       //http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
        setTimeout(
          $scope.$apply(function(){
            set_active_user(activeuserlist)
          }),0);
    });

    socket.on('crashed', function(data){
        setTimeout(
          $scope.$apply(function(){
            $scope.crashed_instances = data;
          })
        ,0)
    });

    socket.on('log', function(log_data){
      setTimeout(
        $scope.$apply(function(){
          add_log(log_data)})
          ,0);
    });
  });
