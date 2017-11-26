var socket;
$(function() { // DOM is ready
  $("#get_form").submit(function(event) { // submit handler for logging in
    // get values from form
    var username = $(this).find('input[name="username"]').val();
    var password = $(this).find('input[name="password"]').val();
    if (password != "" && username != "") {
      var send_url = 'retrieve?' + 'username=' + username + '&password=' + password;
      // do Ajax
      $.ajax({
        url: send_url,
        type: 'GET',
        success: function(result) {
          if (result == "error") {
            // do error shit
            $("#info").html(result);
          } else {
            // login
            $("#welcome").hide();
            $("#lobby").show();
            $("#game").hide();
            socket.emit('login', {username: result});
          }
        }
      });
    } else {
      $('#info').html('Please fill out the form before searching for users!');
    }
    event.preventDefault(); // stop default submit action
  });
  $("#put_form").submit(function(event) { // submit handler for PUT form
    // get value from form
    var username = $(this).find('input[name="username"]').val();
    var password = $(this).find('input[name="password"]').val();
    if (password != "" && username != "") {
      var send_url = 'create?' + 'username=' + username + '&password=' + password;
      // do Ajax
      $.ajax({
        url: send_url,
        type: 'PUT',
        success: function(result) {
          if (result == "error") {
            // do error shit
            $("#info").html(result);
          } else {
            // login
            $("#welcome").hide();
            $("#lobby").show();
            $("#game").hide();
            socket.emit('login', {username: result});
          }
        }
        });
    } else {
      $('#info').html('Please fill out the form completely before creating a user!');
    }
    event.preventDefault(); // stop default submit action
  });
  // dealing with messages
  $('#f1').submit(function(event){
    event.preventDefault();
    var m = $('#m').val();
    $('#m').val('');
    socket.emit('chat_message', {message: m});
  });
});