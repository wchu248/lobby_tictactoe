var socket = io.connect('/');
var clientUsername;

// show which user you are!
socket.on('username', function(data) {
  clientUsername = data.username;
  $("#username").text(data.username);
});

// show when a new user joins
socket.on('joinlobby', function(data) {
  document.getElementById('online_users').innerHTML = '';
  for (var socketID in data.lobby) {
    if (clientUsername != data.lobby[socketID]) {
      $("#online_users").append($("<button>").text(data.lobby[socketID]).attr('id', socketID).on('click', function() {
        var target_user = $(this).attr('id');
        socket.emit('invite', {sender: clientUsername, target_user: target_user});
      }));
    }
  }
});

// message box
socket.on('new_message', function(data) {
  $('#messages').append($('<li>').text(data.username + ": " + data.message));
});

// when you receive an invite
socket.on('invite', function(data) {
  $("#info").text("You received an invite to play from " + data.opponent);
})