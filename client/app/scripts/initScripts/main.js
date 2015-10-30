
$(document).ready(function () {
  init_chart();
  socket.emit('get_all_data',"");
});
