// ./public/javascript.js

// Get the current username from the cookies
var user = cookie.get('user');
while (!user) {

  // Ask for the username if there is none set already
  user = prompt('Choose a username:');
  if (!user) {
    alert('You must enter a username');
  } else {
    // Store it in the cookies for future use
    cookie.set('user', user);
  }
}

var socket = io();
socket.emit("join",cookie.get('user') || 'Anonymous')

// The user count. Can change when someone joins/leaves
socket.on('count', function (data) {
    $('.user-count').html(`${data} users`);
});

// When we receive a message
// it will be like { user: 'username', message: 'text' }
socket.on('message', function (data) {
    $('.chat').append('<p><strong>' + DOMPurify.sanitize(data.user) + '</strong>: ' + DOMPurify.sanitize(data.message) + '</p>');
    $('.chat').scrollTop($('.chat')[0].scrollHeight);
});

socket.on('joinMessage', function (data) {
    $('.chat').append('<p><strong>' + DOMPurify.sanitize(data) + '</strong> has joined</p>');
    $('.chat').scrollTop($('.chat')[0].scrollHeight);
});

socket.on('leaveMessage', function (data) {
    $('.chat').append('<p><strong>' + DOMPurify.sanitize(data) + '</strong> has disconnected</p>');
    $('.chat').scrollTop($('.chat')[0].scrollHeight);
});

socket.on('imageMessage', function (data) {
    $('.chat').append('<img src="' +data.image+ '">');
    $('.chat').scrollTop($('.chat')[0].scrollHeight);
});

// When the form is submitted
$('form').submit(function (e) {
  // Avoid submitting it through HTTP
  e.preventDefault();

  // Retrieve the message from the user
  var message = $(e.target).find('input').val();

  // Send the message to the server
  socket.emit('message', {
    user: cookie.get('user') || 'Anonymous',
    message: message
  });

  // Clear the input and focus it for a new message
  e.target.reset();
  $(e.target).find('input').focus();
});

// Handle image upload
$('#imageInput').on('change', function() {
    const file = this.files[0];
  
    // Read the selected image file as a base64-encoded data URL
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      const dataUrl = reader.result;
  
      // Send the image data to the server
      socket.emit('image', { image: dataUrl });
    };
  });
  