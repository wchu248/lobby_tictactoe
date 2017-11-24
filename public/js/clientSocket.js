var socket = io.connect('/');
socket.on('players', function (data) {
  $("#numPlayers").text(data.number);
});
socket.on('welcome', function (data) {
  $("#welcome").text("Welcome player " + data.currPlayer);
});