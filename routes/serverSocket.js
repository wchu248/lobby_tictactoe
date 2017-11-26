var lobbyUsers = {};

exports.init = function(io) {
	var playerLobby = [];
  // When a new connection is initiated
	io.on('connection', function (socket) {

		socket.on('login', function(data) {
			console.log("username: " + data.username);
			socket.userId = data.username;  
			lobbyUsers[data.username] = socket.id;
			console.log("lobby: ");
			console.log(lobbyUsers);
			socket.broadcast.emit('joinlobby', {lobby: lobbyUsers});
		});

		socket.on('disconnect', function () {
		});
	});
}
