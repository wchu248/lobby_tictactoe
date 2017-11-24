$(function() { // DOM is ready
  $("#login").submit(function(event) {
    $.ajax({
      url: '/login',
      type: "GET"
    });
  }); 
  // $("#get_form").submit(function(event) { // submit handler for GET form
  //   // get values from form
  //   var username = $(this).find('input[name="username"]').val();
  //   var password = $(this).find('input[name="password"]').val();
  //   if (password != "" && username != "") {
  //     var send_url = 'retrieve?' + 'username=' + username + '&password=' + password;
  //     // do Ajax
  //     $.ajax({
  //       url: send_url,
  //       type: 'GET',
  //       success: function(result) {
  //         $('#info').html(result);
  //         if (result != "The username and/or password is incorrect.") {
  //           document.getElementById("get_form").reset();
  //         }
  //       }
  //     });
  //   } else {
  //     $('#info').html('Please fill out the form before searching for users!');
  //   }
  //   event.preventDefault(); // stop default submit action
  // });
  $("#put_form").submit(function(event) { // submit handler for PUT form
    // get value from form
    var username = $(this).find('input[name="username"]').val();
    var password = $(this).find('input[name="password"]').val();
    var send_url = 'create?';
    if (username == "" && password != "") {
      send_url += 'password=' + password;
    } else if (password == "" && username != "") {
      send_url += 'username=' + username;
    } else if (password != "" && username != "") {
      send_url += 'username=' + username + '&password=' + password;
    } else {
      send_url = null;
    }
    if (send_url) {
      // do Ajax
      $.ajax({
        url: send_url,
        type: 'PUT',
        success: function(result) {
          $('#message').html(result);
          document.getElementById("put_form").reset();
        }
      });
    } else {
      $('#message').html('Please fill out the form before creating a user!');
    }
    event.preventDefault(); // stop default submit action
  });
  $("#post_form").submit(function(event) { // submit handler for POST form
    // get values from form
    var find_username = $(this).find('input[name="username"]').val();
    var find_password = $(this).find('input[name="password"]').val();
    var change_username = $(this).find('input[name="change_username"]').val();
    var change_password = $(this).find('input[name="change_password"]').val();
    var send_url = 'update?';
    // add the find parameter
    if (find_username == "" && find_password != "") {
      send_url += 'find={' + '\"password\":\"' + find_password + '\"}';
    } else if (find_password == "" && find_username != "") {
      send_url += 'find={' + '\"username\":\"' + find_username + '\"}';
    } else if (find_password != "" && find_username != "") {
      send_url += 'find={' + '\"username\":\"' + find_username + '\",\"password\":\"' + find_password + '\"}';
    } 
    // add the update parameter
    // add & symbol if necessary
    if (send_url) {
      if (change_username == "" && change_password == "") {
        // don't modify send_url
        var nothing = 1;
      } else {
        if (send_url != 'update?') {
          send_url += "&update={\"$set\":{";
        } else {
          send_url += "update={\"$set\":{";
        }
        if (change_username == "" && change_password != "") {
          send_url += '\"password\":\"' + change_password + '\"}}';
        } else if (change_password == "" && change_username != "") {
          send_url += '\"username\":\"' + change_username + '\"}}';
        } else if (find_password != "" && change_username != "") {
          send_url += '\"username\":\"' + change_username + '\",\"password\":\"' + change_password + '\"}}';
        } 
        if (change_username == "" && change_password == "" && find_username == "" && find_password == "") {
          send_url = null;
        }
      }
    }
    if (send_url) {
      // do Ajax
      $.ajax({
        url: send_url,
        type: 'POST',
        success: function(result) {
          $('#message').html(result);
          document.getElementById("post_form").reset();
        }
      });
    } else {
      $('#message').html('Please fill out the form before updating a user!');
    }
    event.preventDefault(); // stop default submit action
  });
  $("#delete_form").submit(function(event) { // submit handler for DELETE form
    // get value from form
    var username = $(this).find('input[name="username"]').val();
    var password = $(this).find('input[name="password"]').val();
    var send_url = 'delete?find={'
    if (username == "" && password != "") {
      send_url += '\"password\":\"' + password + '\"}';
    } else if (password == "" && username != "") {
      send_url += '\"username\":\"' + username + '\"}';
    } else if (password != "" && username != "") {
      send_url += '\"username\":\"' + username + '\",\"password\":\"' + password + '\"}';
    } else {
      send_url = null;
    }
    if (send_url) {
      // do Ajax
      $.ajax({
        url: send_url,
        type: 'DELETE',
        success: function(result) {
          $('#message').html(result);
          document.getElementById("delete_form").reset();
        }
      });
    } else {
      $('#message').html('Please fill out the form before deleting a user!');
    }
    event.preventDefault(); // stop default submit action
  });
});