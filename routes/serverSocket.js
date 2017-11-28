var onlineUsers = {};
var inGameUsers = {};

exports.init = function(io) {

  // When a new connection is initiated
	io.on('connection', function (socket) {

		// helper functions
		function refreshLobby() {
			socket.emit('joinlobby', {lobby: onlineUsers, inGameLobby: inGameUsers});
			socket.broadcast.emit('joinlobby', {lobby: onlineUsers, inGameLobby: inGameUsers});
		}

		socket.on('login', function(data) {
			// username is stored in data.username
			console.log("username: " + data.username);
			socket.userId = data.username;  
			onlineUsers[socket.id] = data.username;
			console.log("lobby: ");
			console.log(onlineUsers);
			socket.emit('username', {username: data.username});
			refreshLobby();
		});

		socket.on('new_message', function(data) {
			// message is stored in data.message
			data['username'] = onlineUsers[socket.id]; // show who sent the message
			socket.emit('new_message', data);
      socket.broadcast.emit('new_message', data);
		});

		// processing invites to games
		socket.on('invite', function(data) {
			// sender username is stored in data.sender
			// target user socketID is stored in data.target_user
			var sender = data.sender;
			var target_user = onlineUsers[data.target_user];
			socket.broadcast.to(data.target_user).emit('invite', {opponent: sender, opponentID: socket.id});
		});

		// rejecting games
		socket.on('reject_game', function(data) {
			socket.broadcast.to(data.inviterID).emit('rejected_invite', {rejecter: data.rejecter});
		});

		// accepting games
		socket.on('accept_game', function(data) {
			// make both players have in-game status
			inGameUsers[data.player1ID] = data.player1;
			inGameUsers[data.player2ID] = data.player2;
			refreshLobby();
			// initialize the game for both players
			var gameBoard = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
			// randomly choose who goes first
			var turn_num = Math.floor(Math.random() * 2) + 1;
			// emit to client
			socket.emit('start_game', {opponent: data.player2, opponentID: data.player2ID, 
																 gameBoard: gameBoard, your_turn: (turn_num == 1 ? true: false)});
			// emit to client's opponent
			socket.broadcast.to(data.player2ID).emit('start_game', {opponent: data.player1, opponentID: data.player1ID, 
																															gameBoard: gameBoard, your_turn: (turn_num == 2 ? true: false)})
		});


		// when someone resigns a game
		socket.on('game_resigned', function(data) {
			// remove them from in game lobby
			delete inGameUsers[data.resignerID];
			delete inGameUsers[data.opponentID];
			console.log('inGameUsers:');
			console.log(inGameUsers);
			socket.emit('game_resigned', {resigner: true, opponentName: onlineUsers[data.opponentID]});
			socket.broadcast.to(data.opponentID).emit('game_resigned', {resigner: false, opponentName: onlineUsers[data.resignerID]});
			refreshLobby();
		});

		socket.on('disconnect', function () {
			delete onlineUsers[socket.id];
			delete inGameUsers[socket.id];
			refreshLobby();
		});
	});
}
