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
			socket.userId = data.username;  
			onlineUsers[socket.id] = data.username;
			socket.emit('username', {username: data.username});
			refreshLobby();
		});

		socket.on('new_message', function(data) {
			// message is stored in data.message
			data['username'] = onlineUsers[socket.id]; // show who sent the message
			socket.emit('new_message', data);
			socket.broadcast.emit('new_message', data);
			refreshLobby();
		});

		// processing invites to games
		socket.on('invite', function(data) {
			// sender username is stored in data.sender
			// target user socketID is stored in data.target_user
			var sender = data.sender;
			var target_user = onlineUsers[data.target_user];
			socket.broadcast.to(data.target_user).emit('invite', {opponent: sender, opponentID: socket.id});
			refreshLobby();
		});

		// rejecting games
		socket.on('reject_game', function(data) {
			socket.broadcast.to(data.inviterID).emit('rejected_invite', {rejecter: data.rejecter});
			refreshLobby();
		});

		// accepting games
		socket.on('accept_game', function(data) {
			// make both players have in-game status
			inGameUsers[data.player1ID] = data.player1;
			inGameUsers[data.player2ID] = data.player2;
			refreshLobby();
			// initialize the game for both players
			var gameBoard = [['', '', ''], ['', '', ''], ['', '', '']];
			// randomly choose who goes first
			var turn_num = Math.floor(Math.random() * 2) + 1;
			// emit to client
			socket.emit('next_turn', {opponent: data.player2, opponentID: data.player2ID, 
																 gameBoard: gameBoard, your_turn: (turn_num == 1 ? true: false),
																 symbol: (turn_num == 1 ? 'X': 'O')});
			// emit to client's opponent
			socket.broadcast.to(data.player2ID).emit('next_turn', {opponent: data.player1, opponentID: data.player1ID, 
																															gameBoard: gameBoard, your_turn: (turn_num == 2 ? true: false),
																															symbol: (turn_num == 1 ? 'O': 'X')})
		});

		// when a move is made
		socket.on('move_made', function(data) {
			console.log('board:', data.gameBoard);
			console.log(data);
			socket.emit('next_turn', {opponent: data.opponent, opponentID: data.opponentID,
																gameBoard: data.gameBoard, your_turn: !data.your_turn,
															  symbol: data.symbol});
			socket.broadcast.to(data.opponentID).emit('next_turn', {opponent: inGameUsers[socket.id], opponentID: socket.id,
																															gameBoard: data.gameBoard, your_turn: true,
																															symbol: (data.symbol == 'X' ? 'O' : 'X')});
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

		socket.on('game_over', function(data) {
			if (data.status == "tie") {
				socket.emit('game_over', {status: "tie", opponent: inGameUsers[data.opponentID]});
				socket.broadcast.to(data.opponentID).emit('game_over', {status: "tie", opponent: inGameUsers[socket.id]});
			} else {
				socket.emit('game_over', {status: "win", opponent: inGameUsers[data.opponentID]});
				socket.broadcast.to(data.opponentID).emit('game_over', {status: "loss", opponent: inGameUsers[socket.id]});
			}
			refreshLobby();
		});

		socket.on('return_to_lobby', function(data) {
			delete inGameUsers[socket.id];
			refreshLobby();
		});
		
		socket.on('logout', function() {
			if (Object.values(inGameUsers).indexOf(inGameUsers[socket.id]) > -1) {
				console.log('confirm logout');
				socket.emit('confirm_logout');
			} else {
				socket.emit('logout_successful');
				delete onlineUsers[socket.id];
				delete inGameUsers[socket.id];
				refreshLobby();
			}
		});

		socket.on('logout_confirmed', function(data) {
			socket.broadcast.to(data.opponentID).emit('opponent_logout', {opponent: onlineUsers[socket.id]});
			delete onlineUsers[socket.id];
			delete inGameUsers[socket.id];
			delete inGameUsers[data.opponentID];
			refreshLobby();
		});

		socket.on('disconnect', function () {
			delete onlineUsers[socket.id];
			delete inGameUsers[socket.id];
			refreshLobby();
		});
	});
}
