var lobbyUsers = {};

exports.init = function(io) {
	var playerLobby = [];
  // When a new connection is initiated
	io.on('connection', function (socket) {

		socket.on('login', function(data) {
			// username is stored in data.username
			console.log("username: " + data.username);
			socket.userId = data.username;  
			lobbyUsers[socket.id] = data.username;
			console.log("lobby: ");
			console.log(lobbyUsers);
			socket.emit('username', {username: data.username});
			socket.broadcast.emit('joinlobby', {lobby: lobbyUsers});
		});

		socket.on('new_message', function(data) {
			// message is stored in data.message
			data['username'] = lobbyUsers[socket.id]; // show who sent the message
			socket.emit('new_message', data);
      socket.broadcast.emit('new_message', data);
		})

		socket.on('disconnect', function () {
		});
	});
}
