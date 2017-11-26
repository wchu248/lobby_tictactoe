function checkUserExists(playerLobby, username) {
	for (var i = 0; i < playerLobby.length; i++) {
		if (playerLobby[i].username == username) {
			return true;
		}
	}
	return false;
}

exports.init = function(io) {
	var playerLobby = [];
  // When a new connection is initiated
	io.on('connection', function (socket) {
		socket.on('add_to_lobby', function(data) {
			if (checkUserExists(playerLobby, data.username) == false) {
				playerLobby.push({id : socket.id, username: data.username, status: "online"});
			}
			console.log(playerLobby);
			socket.emit('new_lobby_show', {lobby: playerLobby});
			socket.broadcast.emit('new_lobby_show', {lobby: playerLobby});
		});
		socket.on('joined_lobby', function(data) {
			console.log('ehllo');
			// socket.emit('add_to_lobby', {username: data.username});
		});
		socket.on('disconnect', function () {
		});
	});
}
