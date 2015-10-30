var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var crypto = require('crypto');
var _ = require('lodash');
var path = require('path');
var root_dir = path.join(__dirname, '../');
var dbLogger = require('./dbLogger');
var logger = require('./logger.js');

app.use(express.static(root_dir+'/client/'));
app.use(express.static(root_dir+'/client/app/'));
// namespaces for different connection types
var io_logs = io.of('/logs_channel');
var io_dashboard = io.of('/dashboard_channel');

var port = process.env.PORT || 8080;
server.listen(port);

var connected_sessions =[];
var crashed_instaces= [];
var recent_logs = [];
var max_recent_logs = 10;

var send_msg = function(socket,event_type,msg){
    socket.emit(event_type,msg);
    logger.olog(event_type+" "+msg );
}
app.get('/', function (req, res) {
    logger.statlog("http connection request...");
    res.sendFile('index.html',root_dir+'/client/app');
});

logger.statlog("listenning on "+ port);

var remove_user = function (key) {
  var index = connected_sessions.indexOf(key);
  if(index>-1){
    connected_sessions.splice(index,1);
  }
  else{
    logger.errlog("unable to find the key "+key.id);
  }
};

var get_room_names_for_socket = function (socket){
  var room_names =[];
  _.forEach(socket.adapter.rooms,function(value,key){
    var default_room = false;
    for(var property in value){
      if(property == key){
          default_room = true;
      }
    }
    if(!default_room){
      room_names.push(key);
    }
  });
  return room_names;
}
var get_all_connected_room_names = function(io_channel){
 var all_room_names =[];
 for(var index =0;index<io_channel.sockets.length;index++){
   var soc_rooms = get_room_names_for_socket(io_channel.sockets[index]);
   for(var index2 =0;index2< soc_rooms.length;index2++){
     var index3 = all_room_names.indexOf(soc_rooms[index2]);
     if(index3<=-1){
        all_room_names.push(soc_rooms[index2]);
     }
   }
 }
 return all_room_names;
}

var send_tool_list = function(){
  setTimeout(function(){
    var active_tools = get_all_connected_room_names(io_logs);
    send_msg(io_dashboard,'set_tool_list',active_tools);
  },0)
}

var send_current_users_info = function(){
  setTimeout(function(){
  var active_users =[];
  for(var i=0;i<connected_sessions.length;i++){
    var session_data = {platform      : connected_sessions[i].tool_platform,
                        session_start : connected_sessions[i].tool_starttime,
                        tool          : connected_sessions[i].tool_name,
                        username      : connected_sessions[i].tool_username,
                        version       : connected_sessions[i].tool_version,
                        session_id    : connected_sessions[i].session_id}
    active_users.push(session_data);

  }
logger.statlog("number of active users:\t"+active_users.length);
  send_msg(io_dashboard,'list_active_users',active_users);
  },0);
};

var send_crashed_instances_data = function(){
  setTimeout(function(){
      send_msg(io_dashboard,'crashed', crashed_instaces);
  },0);
}

var get_new_session_id = function(data){
  var md5sum = crypto.createHash('md5');
  md5sum.update(data);
  return md5sum.digest('hex');
}

var run_command_at_clients = function(_command,_session_id){
  for(var i = 0;i<connected_sessions.length;i++){
    if(connected_sessions[i].session_id ==_session_id){
      send_msg(connected_sessions[i],'command',_command);
    }
  }
}


io_dashboard.on('connection',function(socket){
    logger.statlog('connection from dashboard');

    socket.on('get_all_data',function(data){
      logger.statlog("sending all data to dashboard at "+socket.id);
      send_current_users_info();
      send_tool_list();
      send_crashed_instances_data();
      // send the latest max_recent_logs logs to the new connection
      _.forEach(recent_logs,function(value,key){
        send_msg(socket,'log',value);
      });
    });

    socket.on('command', function(data){
      logger.statlog("Received request to run command "+data.command+"\t session id: "+data.session_id);
      setTimeout(function(){
        run_command_at_clients(data.command,data.session_id)
      },0);
    });
});

io_logs.on('connection', function (socket) {
  var clientIp = socket.request.connection.remoteAddress
  logger.statlog(clientIp+ " at : "+ socket.id);
  send_msg(socket,'send_session_info',"now")
  send_current_users_info();

// on receiving a log message, forward it to the view.
  socket.on('log', function (data) {
    try{
      var username = socket.tool_username;
      logger.ilog(username+"\t"+data);
      var log_data = {username    : username,
                      msg         : data,
                      session_id  : socket.session_id};

      dbLogger.add_log_to_database(log_data);
      send_msg(io_dashboard,'log',log_data);
      // do the circular buffer step
      if(recent_logs.length >= max_recent_logs){
        recent_logs.splice(0,1);
      }
      recent_logs.push(log_data);
    }
    catch(e){
      logger.errlog(e);
    }
  });

  socket.on('session_info_details', function(usernamestr,toolname,version_data,platform_data,starttime){
    logger.statlog(" user: "+ usernamestr);
    // if the session info doesnt exist in the collection, add it
    var index = connected_sessions.indexOf(socket);

    if(index==-1){
      var clientIp = socket.request.connection.remoteAddress
      var session_str = platform_data+starttime+toolname+usernamestr+version_data+clientIp
      connected_sessions.push(socket);
      socket.tool_platform = platform_data;
      socket.tool_starttime = starttime;
      socket.tool_name = toolname;
      socket.tool_username = usernamestr;
      socket.tool_version = version_data;
      socket.session_id = get_new_session_id(session_str);
      socket.client_address= clientIp;

      socket.join(toolname);
      dbLogger.add_session_to_database(socket);

      send_msg(socket,'status','Thank you for session info! The session is now available on Dashboard');
      send_current_users_info();
      send_tool_list();
      send_crashed_instances_data();
    }
  });

  //do some clean up...
  socket.on('closing', function(data){
    logger.statlog("closing session from :\t"+socket);
    send_msg(socket,'exit_reponse_reached',"Ok");
    remove_user(socket);
    send_current_users_info();
    send_tool_list();
  });

  //on disconnet if the tool crashed
  socket.on('disconnect', function(){
    logger.statlog("disconnected : "+socket.id);
    var session_crashed = false;
    for(var i = 0;i<connected_sessions.length;i++){
      if(connected_sessions[i] ==socket){
        crashed_instaces.push({tool:connected_sessions[i].tool_name});
        session_crashed =true;
      }
    }
    if(session_crashed){
      send_crashed_instances_data();
      remove_user(socket);
      send_current_users_info();
      send_tool_list();
    }
  })
});
