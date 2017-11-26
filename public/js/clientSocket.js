var socket = io.connect('/');
socket.on('joinlobby', function(data) {
  document.getElementById('online_users').innerHTML = '';
  for (var username in data.lobby) {
    $("#online_users").append($("<li>").text(username));
  }
});
