// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

// Routing
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/views/pages'));
app.use(express.static(__dirname + '/public/views/partials'));
app.use(express.static(__dirname + '/public/assets'));
app.use(express.static(__dirname + '/public/session'));

app.use(require('./controllers'))

//set view engine
app.set('view engine', 'ejs');
//set views directory
app.set('views', './public/views')

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});



// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('_add_user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    console.log("new user:" + socket.username);

    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('_user_joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the user disconnects.. perform this
  socket.on('_disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('_user_left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
