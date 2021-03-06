var socket = io.connect('/');
var clientUsername;
var clientSocketID;

// helper functions

function showGameInfo(data, clientUsername, clientSocketID) {
  $("#playing_against").text('Playing a game against ' + data.opponent + '.' );
  $("#symbol").text('Your symbol: ' + data.symbol);
  $("#opponent_id").text(data.opponentID);
  $("#turn").text(data.your_turn ? 'Your turn' : 'Opponent turn');
  // show resign button
  drawResignButton(data, clientUsername, clientSocketID);
  // draw the board
  drawGameBoard(data, clientUsername, clientSocketID);
}

function drawResignButton(data, clientUsername, clientSocketID) {
  $("#resign_button").empty();
  $("#resign_button").append($("<button>").text("Resign Game").on('click', function() {
    $("#info").show();
    // show confirmation for resigning game
    $("#info").text("Are you sure you want to resign? You will the lose the game and return to the lobby.");
    $("#info").append($("<br>"));
    $("#info").append($("<button>").text("Yes").on('click', function() {
      // return both players to the lobby
      socket.emit('game_resigned', {resignerID: clientSocketID, opponentID: data.opponentID});
    }));
    $("#info").append($("<button>").text("No").on('click', function() {
      $("#info").hide();
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
                            .css('left', (c - 1.5) * (50) + 'px')
                            .css('border-top', top ? '1px solid black' : '1px solid white')
                            .css('border-bottom', bottom ? '1px solid black' : '1px solid white')
                            .css('border-left', left ? '1px solid black' : '1px solid white')
                            .css('border-right', right ? '1px solid black' : '1px solid white')
                            .css('color', data.gameBoard[r][c] == 'X' ? 'red' : 'blue')
                            // show X's and O's
                            .text(data.gameBoard[r][c])
                            .on('click', function() {
        // do logic for game clicks here
        var row_col_str = $(this).attr('id'), row = row_col_str[0], col = row_col_str[2];
        if (data.your_turn && checkGameOver(data.gameBoard) == false) {
          if (data.gameBoard[row][col] == '') {
            $("#info").hide();
            makeMove(data, row, col, clientUsername, clientSocketID)
          } else {
            $("#info").show();
            $("#info").text("Please choose an empty box to make your move.");
          }
        } else {
          $("#info").show();
          if (checkGameOver(data.gameBoard) == true || checkGameOver(data.gameBoard) == "tie") {
            $("#info").text("The game is over already!");
            // draw button for returning to lobby
            $("#info").append($("<br>"));
            $("#info").append($("<button>").text("Return to Lobby").on('click', function() {
              $("#welcome").hide();
              $("#lobby").show();
              $("#game").hide();
              $("#info").hide();
              $("#playing_against").empty();
              $("#symbol").empty();
              socket.emit('return_to_lobby', data);
            }));
          } else {
            $("#info").text("It's not your turn!");
          }
        }
      });
      $("#board").append(cell);
    }
  }
}

function makeMove(data, r, c, clientUsername, clientSocketID) {
  var cell_letter = data.symbol;
  data.gameBoard[r][c] = data.symbol;
  data[cell_letter] = cell_letter;
  socket.emit('move_made', data);
  // check if game is over on client side to know if that person won
  // gameStatus can either be true, false, or "tie"
  var gameStatus = checkGameOver(data.gameBoard);
  // only do something if the game ends
  if (gameStatus == "tie") {
    socket.emit('game_over', {status: "tie", opponentID: data.opponentID});
  }
  if (gameStatus == true) {
    socket.emit('game_over', {status: "win", opponentID: data.opponentID});
  }
}

function checkGameOver(board) {
  // check for ties
  if (isBoardFull(board)) {
    return "tie";
  }
  // check horizontal wins
  for (var row = 0; row < board.length; row++) {
    if (board[row][0] != '' && board[row][0] == board[row][1] && board[row][1] == board[row][2]) {
      return true;
    }
  }
  // check vertical wins
  for (var col = 0; col < board.length; col++) {
    if (board[0][col] != '' && board[0][col] == board[1][col] && board[1][col] == board[2][col]) {
      return true;
    }
  }
  // check diagonal wins
  if (board[0][0] != '' && board[0][0] == board[1][1] && board[1][1] == board[2][2]) {
    return true;
  }
  if (board[0][2] != '' && board[0][2] == board[1][1] && board[1][1] == board[2][0]) {
    return true;
  }
  return false;
}

function isBoardFull(board) {
  for (var r = 0; r < board.length; r++) {
    for (var c = 0; c < board[0].length; c++) {
      if (board[r][c] == '') {
        return false;
      }
    }
  }
  return true;
}

socket.on('already_logged_in', function() {
  $("#info").show();
  $("#info").text("Sorry! That user is already logged in.");
});

// show which user you are!
socket.on('username', function(data) {
  clientUsername = data.username;
  $("#username").text("Welcome, " + data.username);
  $("#logout").show();
  $("#welcome").hide();
  $("#lobby").show();
  $("#game").hide();
  $("#info").hide();
  $("#error").hide();
});

// show when a new user joins
socket.on('joinlobby', function(data) {
  var color;
  document.getElementById('online_user_list').innerHTML = '';
  for (var socketID in data.lobby) {
    if (clientUsername != data.lobby[socketID]) {
      // set color of button based on status of that user
      if (Object.values(data.inGameLobby).indexOf(data.lobby[socketID]) > -1) {
        // orange if in game
        color = "orange";
      } else {
        // green if hanging out in lobby
        color = "rgb(66, 183, 42)";
      }
      $("#online_user_list").append($("<button>").text(data.lobby[socketID]).attr('id', socketID).on('click', function() {
        var target_user = $(this).attr('id');
        if (Object.values(data.inGameLobby).indexOf(data.lobby[socketID]) > -1) {
          $("#info").show();
          $("#info").text("Sorry! " + data.lobby[target_user] + " is currently in a game.");
        } else {
          socket.emit('invite', {sender: clientUsername, target_user: target_user});
          $("#info").show();
          $("#info").text("Sending an invition to " + data.lobby[target_user] + "...");
        }
      }).css('background-color', color).css('margin-right', '10px').css('margin-bottom', '10px'));
    } else {
      clientSocketID = socketID;
    }
  }
});

// message box
socket.on('new_message', function(data) {
  $('#messages').append($('<li>').text(data.username + ": " + data.message));
  var elem = document.getElementById('messages');
  elem.scrollTop = elem.scrollHeight;
});

// when you receive an invite
socket.on('invite', function(data) {
  $("#info").show();
  $("#info").text("You received an invite to play from " + data.opponent + "!");
  $("#info").append($("<br>"));
  $("#info").append($("<button>").text("Accept").on('click', function() {
    // do stuff when accepting game
    socket.emit('accept_game', {player1: clientUsername, player1ID: clientSocketID, player2: data.opponent, player2ID: data.opponentID});
  }));
  $("#info").append($("<button>").text("Reject").on('click', function() {
    // send message to inviter that invite is rejected
    socket.emit('reject_game', {rejecter: clientUsername, inviterID: data.opponentID});
    // clear notification
    $("#info").show();
    $("#info").text("You rejected the invitation from " + data.opponent);
  }));
})

// when you reject an invite
socket.on('rejected_invite', function(data) {
  $("#info").show();
  $("#info").text("Sorry! " + data.rejecter + " rejected your invitation :(");
});

// starting the game!
socket.on('next_turn', function(data) {
  $("#info").hide();
  $("#playing_against").empty();
  $("#symbol").empty();
  // show game screen
  $("#welcome").hide();
  $("#lobby").hide();
  $("#game").show();
  showGameInfo(data, clientUsername, clientSocketID);
});

// when a game is resigned, return both players to lobby
socket.on('game_resigned', function(data) {
  $("#info").hide();
  // show lobby
  $("#welcome").hide();
  $("#lobby").show();
  $("#game").hide();
  $("#playing_against").empty();
  $("#symbol").empty();
  if (data.resigner) {
    $("#info").show();
    $("#info").text("You resigned the game against " + data.opponentName + ". You lose :(");
  } else {
    $("#info").show();
    $("#info").text(data.opponentName + " resigned the game against you. You win :)");
  }
});

socket.on('game_over', function(data) {
  $("#info").hide();
  $("#resign_button").empty();
  if (data.status == "tie") {
    $("#info").text("The game against " + data.opponent + " ended in a tie.");
    $("#info").show();
  }
  if (data.status == "loss") {
    $("#info").text("You lost the game against " + data.opponent + " :(");
    $("#info").show();
  }
  if (data.status == "win") {
    $("#info").text("You won the game against " + data.opponent + " :)");
    $("#info").show();
  }
  // draw button for returning to lobby
  $("#info").append($("<br>"));
  $("#info").append($("<button>").text("Return to Lobby").on('click', function() {
    $("#welcome").hide();
    $("#lobby").show();
    $("#game").hide();
    $("#info").hide();
    $("#playing_against").empty();
    $("#symbol").empty();
    socket.emit('return_to_lobby', data);
  }));
});

socket.on('confirm_logout', function() {
  $("#info").show();
  $("#info").text("Are you sure you want to log out? You will resign this game.");
  $("#info").append($("<br>"));
  $("#info").append($("<button>").text("Yes").on('click', function() {
    $("#welcome").show();
    $("#lobby").hide();
    $("#game").hide();
    $("#info").show();
    $("#info").text("Logged out!");
    $("#username").text("");
    $("#error").hide();
    $("#logout").hide();
    socket.emit('logout_confirmed', {opponentID: $("#opponent_id").text()});
  }));
  $("#info").append($("<button>").text("No").on('click', function() {
    $("#info").hide();
  }));
});

socket.on('opponent_logout', function(data) {
  $("#info").show();
  $("#info").text(data.opponent + " logged out and resigned the game against you. You win :)");
  $("#welcome").hide();
  $("#lobby").show();
  $("#game").hide();
});

socket.on('logout_successful', function() {
  $("#username").text("");
  $("#info").show();
  $("#info").text("Logged out!");
  $("#welcome").show();
  $("#lobby").hide();
  $("#game").hide();
});