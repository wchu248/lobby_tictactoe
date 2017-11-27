var socket = io.connect('/');
var clientUsername;
var clientSocketID;

// show which user you are!
socket.on('username', function(data) {
  clientUsername = data.username;
  $("#username").text("Welcome, " + data.username);
});

// show when a new user joins
socket.on('joinlobby', function(data) {
  document.getElementById('online_users').innerHTML = '';
  for (var socketID in data.lobby) {
    if (clientUsername != data.lobby[socketID]) {
      $("#online_users").append($("<button>").text(data.lobby[socketID]).attr('id', socketID).on('click', function() {
        var target_user = $(this).attr('id');
        socket.emit('invite', {sender: clientUsername, target_user: target_user});
      }));
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
  $("#info").append($("<button>").text("Accept").attr('id', clientSocketID).on('click', function() {
    // do stuff when accepting game
    socket.emit('accept_game', {player1: clientUsername, player1ID: clientSocketID, player2: data.opponent, player2ID: data.opponentID});
  }));
  $("#info").append($("<button>").text("Reject").attr('id', clientSocketID).on('click', function() {
    // send message to inviter that invite is rejected
    socket.emit('reject_game', {rejecter: clientUsername, inviterID: data.opponentID});
    // clear notification
    $("#info").empty();
  }));
})

// when you reject an invite
socket.on('rejected_invite', function(data) {
  $("#info").text("Sorry! " + data.rejecter + " rejected your invitation :(");
});

// starting the game!
socket.on('start_game', function(data) {
  $("#welcome").hide();
  $("#lobby").hide();
  $("#game").show();
  $("#info").text('Playing a game with ' + data.opponent);
});