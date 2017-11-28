var socket = io.connect('/');
var clientUsername;
var clientSocketID;

// helper functions

function showGameInfo(data, clientUsername, clientSocketID) {
  $("#playing_against").text('Playing a game against ' + data.opponent);
  $("#turn").text(data.your_turn ? 'Your turn' : 'Enemy turn');
  // show resign button
  drawResignButton(data, clientUsername, clientSocketID);
  // draw the board
  drawGameBoard(data, clientUsername, clientSocketID);
}

function drawResignButton(data, clientUsername, clientSocketID) {
  $("#resign_button").empty();
  $("#resign_button").append($("<button>").text("Resign Game").on('click', function() {
    // show confirmation for resigning game
    $("#info").text("Are you sure you want to resign? You will the lose the game and return to the lobby.");
    $("#info").append($("<button>").text("Yes").on('click', function() {
      // return both players to the lobby
      socket.emit('game_resigned', {resignerID: clientSocketID, opponentID: data.opponentID});
    }));
    $("#info").append($("<button>").text("No").on('click', function() {
      $("#info").empty();
    }));
  }));
}

function drawGameBoard(data, clientUsername, clientSocketID) {
  for (var r = 0; r < data.gameBoard.length; r++) {
    for (var c = 0; c < data.gameBoard[0].length; c++) {
      // set variables to check to draw edge borders
      var top = r == 0 ? false : true;
      var bottom = r == 2 ? false : true;
      var left = c == 0 ? false : true;
      var right = c == 2 ? false : true;
      // set class to "cell" for general css purposes
      var cell = $("<div>").attr('class', 'cell').attr('id', r + '_' + c)
                            // css stuff for positioning and borders
                            .css('top', r * (50) + 'px')
                            .css('left', c * (50) + 'px')
                            .css('border-top', top ? '1px solid black' : '1px solid white')
                            .css('border-bottom', bottom ? '1px solid black' : '1px solid white')
                            .css('border-left', left ? '1px solid black' : '1px solid white')
                            .css('border-right', right ? '1px solid black' : '1px solid white')
                            .on('click', function() {
        // do logic for game here
        console.log('clicked at ' + $(this).attr('id'));
      });
      $("#board").append(cell);
    }
  }
}

// show which user you are!
socket.on('username', function(data) {
  clientUsername = data.username;
  $("#username").text("Welcome, " + data.username);
});

// show when a new user joins
socket.on('joinlobby', function(data) {
  var color;
  document.getElementById('online_users').innerHTML = '';
  for (var socketID in data.lobby) {
    if (clientUsername != data.lobby[socketID]) {
      // set color of button based on status of that user
      if (Object.values(data.inGameLobby).indexOf(data.lobby[socketID]) > -1) {
        // orange if in game
        color = "orange";
      } else {
        // green if hanging out in lobby
        color = "green";
      }
      $("#online_users").append($("<button>").text(data.lobby[socketID]).attr('id', socketID).on('click', function() {
        var target_user = $(this).attr('id');
        socket.emit('invite', {sender: clientUsername, target_user: target_user});
        $("#info").text("Sending an invition to " + data.lobby[socketID] + "...");
      }).css('background-color', color));
    } else {
      clientSocketID = socketID;
    }
  }
});

// message box
socket.on('new_message', function(data) {
  $('#messages').append($('<li>').text(data.username + ": " + data.message));
});

// when you receive an invite
socket.on('invite', function(data) {
  $("#info").text("You received an invite to play from " + data.opponent + "!");
  $("#info").append($("<button>").text("Accept").on('click', function() {
    // do stuff when accepting game
    socket.emit('accept_game', {player1: clientUsername, player1ID: clientSocketID, player2: data.opponent, player2ID: data.opponentID});
  }));
  $("#info").append($("<button>").text("Reject").on('click', function() {
    // send message to inviter that invite is rejected
    socket.emit('reject_game', {rejecter: clientUsername, inviterID: data.opponentID});
    // clear notification
    $("#info").text("You rejected the invitation from " + data.opponent);
  }));
})

// when you reject an invite
socket.on('rejected_invite', function(data) {
  $("#info").text("Sorry! " + data.rejecter + " rejected your invitation :(");
});

// starting the game!
socket.on('start_game', function(data) {
  $("#info").empty();
  $("#playing_against").empty();
  // show game screen
  $("#welcome").hide();
  $("#lobby").hide();
  $("#game").show();
  showGameInfo(data, clientUsername, clientSocketID);
});

// when a game is resigned, return both players to lobby
socket.on('game_resigned', function(data) {
  // show lobby
  $("#welcome").hide();
  $("#lobby").show();
  $("#game").hide();
  $("#playing_against").empty();
  if (data.resigner) {
    $("#info").text("You resigned the game against " + data.opponentName + ". You lose :(");
  } else {
    $("#info").text(data.opponentName + " resigned the game against you. You win :)");
  }
});