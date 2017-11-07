exports.init = function(io) {
	var currentPlayers = 0; // keep track of the number of players
	var playerCounter = 0; // keep track of unique player number
	var totalPlayers = 0; // keep track of total users ever
	var gamesStarted = 0; // keep track of number of games started
	var gamesFinished = 0; // keep track of number of games finished
  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		++totalPlayers;
		++currentPlayers;
		++playerCounter;
		// Send ("emit") a 'players' event back to the socket that just connected.
		socket.emit('players', { number: currentPlayers, totalPlayers: totalPlayers, 
															gamesStarted: gamesStarted, gamesFinished: gamesFinished});
		socket.emit('welcome', { currPlayer: playerCounter});

		/*
		 * Emit players events also to all (i.e. broadcast) other connected sockets.
		 * Broadcast is not emitted back to the current (i.e. "this") connection
     */
		socket.broadcast.emit('players', { number: currentPlayers, totalPlayers: totalPlayers, 
			gamesStarted: gamesStarted, gamesFinished: gamesFinished});
		
		/*
		 * Upon this connection disconnecting (sending a disconnect event)
		 * decrement the number of players and emit an event to all other
		 * sockets.  Notice it would be nonsensical to emit the event back to the
		 * disconnected socket.
		 */
		socket.on('disconnect', function () {
			--currentPlayers;
			socket.broadcast.emit('players', { number: currentPlayers});
		});
	});
}
