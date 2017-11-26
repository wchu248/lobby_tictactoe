var socket = io.connect('/');
var clientUsername;
socket.on('username', function(data) {
  clientUsername = data.username;
  $("#username").text(data.username);
});
socket.on('joinlobby', function(data) {
  document.getElementById('online_users').innerHTML = '';
  for (var username in data.lobby) {
    if (clientUsername != username) {
      console.log(clientUsername);
      console.log(username);
      console.log('---------');
      $("#online_users").append($("<li>").text(username));  
    }
  }
});
