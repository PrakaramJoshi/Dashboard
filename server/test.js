var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log("connection established")
  socket.on('chat', function(msg){
    console.log("Received :\t"+msg)
    io.emit('chat', msg);
  });

  socket.on('disconnect', function () {
      console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
