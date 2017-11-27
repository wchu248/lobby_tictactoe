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
			socket.emit('joinlobby', {lobby: lobbyUsers});
			socket.broadcast.emit('joinlobby', {lobby: lobbyUsers});
		});

		socket.on('new_message', function(data) {
			// message is stored in data.message
			data['username'] = lobbyUsers[socket.id]; // show who sent the message
			socket.emit('new_message', data);
      socket.broadcast.emit('new_message', data);
		});

		// processing invites to games
		socket.on('invite', function(data) {
			// sender username is stored in data.sender
			// target user socketID is stored in data.target_user
			var sender = data.sender;
			var target_user = lobbyUsers[data.target_user];
			// console.log(data.target_user);
			socket.broadcast.to(data.target_user).emit('invite', {opponent: sender, opponentID: socket.id});
		});

		// rejecting games
		socket.on('reject_game', function(data) {
			socket.broadcast.to(data.inviterID).emit('rejected_invite', {rejecter: data.rejecter});
		});

		// accepting games
		socket.on('accept_game', function(data) {
			// start the game for both players
			// emit to client
			socket.emit('start_game', {opponent: data.player2, opponentID: data.player2ID});
			// emit to client's opponent
			socket.broadcast.to(data.player2ID).emit('start_game', {opponent: data.player1, opponentID: data.player1ID})
		});

		socket.on('disconnect', function () {
		});
	});
}
