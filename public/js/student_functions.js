var socket;
$(function() { // DOM is ready
  $("#get_form").submit(function(event) { // submit handler for logging in
    $("#error").hide();
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
            $("#error").show();
            $("#error").html("Failed to login. Please try again.");
          } else {
            // login
            // show lobby
            $("#welcome").hide();
            $("#lobby").show();
            $("#game").hide();
            socket.emit('login', {username: result});
          }
        }
      });
    } else {
      $("#error").show();
      $('#error').html('Please fill out the form before searching for users!');
    }
    event.preventDefault(); // stop default submit action
  });
  $("#put_form").submit(function(event) { // submit handler for PUT form
    $("#error").hide();
    // get value from form
    var username = $(this).find('input[name="username"]').val();
    var password = $(this).find('input[name="password"]').val();
    var password_conf = $(this).find('input[name="password_conf"]').val();
    if (password != password_conf) {
      $("#error").show();
      $('#error').html("Passwords don't match");
    } else if (password != "" && username != "") {
      var send_url = 'create?' + 'username=' + username + '&password=' + password;
      // do Ajax
      $.ajax({
        url: send_url,
        type: 'PUT',
        success: function(result) {
          if (result == "error") {
            // do error shit
            $("#error").show();
            $("#error").html("Failed to create account. Please try again.");
          } else {
            // login
            // show lobby
            $("#welcome").hide();
            $("#lobby").show();
            $("#game").hide();
            socket.emit('login', {username: result});
          }
        }
        });
    } else {
      $("#error").show();
      $('#error').html('Please fill out the form completely before creating a user!');
    }
    event.preventDefault(); // stop default submit action
  });

  // dealing with messages
  $('#message_field').submit(function(event){
    event.preventDefault();
    var message = $('#message_text').val();
    if (message != "" && message.replace(/\s/g, '').length) {
      $('#message_text').val('');
      var elem = document.getElementById('messages');
      elem.scrollTop = elem.scrollHeight; 
      socket.emit('new_message', {message: message});
    } 
  });

  $("#login_form_button").on('click', function() {
    $("#put_form").fadeOut();
    $("#get_form").fadeIn();
  });

  $("#register_form_button").on('click', function() {
    $("#get_form").fadeOut();
    $("#put_form").fadeIn();
  });
  
});