// /index.js

const server = require('server');
const { get, socket } = server.router;
const { render } = server.reply;
const fs = require('fs');


let messages = [];

fs.readFile('messages.json', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      messages = JSON.parse(data);
    }
  });   

// Update everyone with the current user count
const onLeave = ctx => {
    ctx.io.emit('count', ctx.io.sockets.sockets.size);
    ctx.io.emit('leaveMessage', ctx.data);
};  


// Send the new message to everyone and store it
const sendMessage = ctx => {
  const message = ctx.data;
  messages.push(message);
  ctx.io.emit('message', message);
  fs.writeFile('messages.json', JSON.stringify(messages), err => {
    if (err) {
      console.error(err);
    }
  });
};

const sendImage = ctx => {
    const message = ctx.data;
    messages.push(message);
    console.log(message.image)
    ctx.io.emit('imageMessage', message);
    fs.writeFile('messages.json', JSON.stringify(messages), err => {
      if (err) {
        console.error(err);
      }
    });
  };

// Send the previous messages to the new user
const sendPreviousMessages = ctx => {
  messages.forEach(message => {
    ctx.socket.emit('message', message);
  });
};

const onJoin = ctx => {
  ctx.io.emit('count', ctx.io.sockets.sockets.size);
  sendPreviousMessages(ctx);
  ctx.io.emit('joinMessage', ctx.data);
};

server([
  get('/', ctx => render('index.html')),
  socket('disconnect', onLeave),
  socket('message', sendMessage),
  socket('image', sendImage),
  socket('join', onJoin)
]);
