var socket = io.connect('/');
socket.on('players', function (data) {
  console.log(data);
  $("#numPlayers").text(data.number);
  $("#totalPlayers").text(data.totalPlayers);
  $("#gamesStarted").text(data.gamesStarted);
  $("#gamesFinished").text(data.gamesFinished);
});
socket.on('welcome', function (data) {
  $("#welcome").text("Welcome player " + data.currPlayer);
});