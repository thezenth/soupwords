// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

//app.use(require('./controllers'));

//file system io
var fs = require('fs');

//models
var Game = require('./models/game').Game;
var Player = require('./models/player').Player;

// Routing

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/views/pages'));
app.use(express.static(__dirname + '/public/views/partials'));
app.use(express.static(__dirname + '/public/assets'));
app.use(express.static(__dirname + '/public/session'));


//set view engine
app.set('view engine', 'ejs');
//set views directory
app.set('views', './public/views')

server.listen(port, function() {
    console.log('Server listening at port %d', port);
});

// Routing
app.get('/', function(req, res) {
    res.render('pages/index');
});

// Chatroom

var numUsers = 0;

var gnsp = io.of('/game-namespace');

function updateClients(gameInfo) {
    console.log('updating clients...');
    gnsp.emit('_update-game', gameInfo);
}

gnsp.on('connection', function(socket) {
    var addedUser = false;

    /*socket.once('disconnect', function() {
        console.log('Got disconnect!');

        //Reset the game data
        fs.readFile('./session/game.json', function(err, jData) {
            var parsed = JSON.parse(jData);
            parsed = Game; //reset the game session data
            fs.writeFile('./session/game.json', JSON.stringify(parsed, null, '\t')); //also, include null and '\t' arguments to keep the data.json file indented with tabs
        });
    });*/

    // when the client emits 'add user', this listens and executes
    socket.on('_add_user', function(username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        console.log("new user:" + socket.username);

        numUsers++;

        var new_player = Player;
        new_player.name = username;

        fs.readFile('./session/game.json', function(err, jData) {
            if (err) {
                console.log(err);
            }

            if (jData) {
                var parsed = JSON.parse(jData);
                parsed['players'].push(new_player);
                fs.writeFile('./session/game.json', JSON.stringify(parsed, null, '\t')); //also, include null and '\t' arguments to keep the data.json file indented with tabs
                updateClients(parsed);
                if(parsed['players'].length == 2) {
                    gnsp.emit('_begin-game');
                }
            }
        });
        addedUser = true;
    });
});
