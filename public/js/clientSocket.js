var socket = io.connect('/');
socket.on('joined_lobby', function(data) {
  // $("#player_list").append($("<li>").text(data.username));
  socket.emit('add_to_lobby', {username: data.username});
});
socket.on('new_lobby_show', function(data) {
  for (var i = 0; i < data.lobby.length; i++) {
    $('#player_list').html(data.lobby);
  }
});