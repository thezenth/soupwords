// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var boggle = require('boggle');

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

// Game =========================================
var allLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var timerOn = false;
var timerEnd = 0;

var numUsers = 0;

var gnsp = io.of('/game-namespace');

function updateClients(gameInfo) {
    console.log('updating clients...');
    gnsp.emit('_update-game', gameInfo);
}

gnsp.on('connection', function(socket) {
    var addedUser = false;

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
                if (parsed['players'].length == 2) {
                    for (var a = 0; a < 16; a++) {
                        parsed['letters'].push(allLetters[randomInt(0, allLetters.length)]);
                        fs.writeFile('./session/game.json', JSON.stringify(parsed, null, '\t')); //also, include null and '\t' arguments to keep the data.json file indented with tabs
                    }
                    if (true) {
                        parsed['boggled'] = boggle(parsed['letters'].join(''));
                        fs.writeFile('./session/game.json', JSON.stringify(parsed, null, '\t')); //also, include null and '\t' arguments to keep the data.json file indented with tabs
                    }
                    if (true) {
                        if (true) {
                            updateClients(parsed);
                        }
                        timerEnd = Date.now() + 60000;
                        gnsp.emit('_begin-game', timerEnd);
                    }

                }
            }
        });
        addedUser = true;
    });
    socket.on('_submit-word', function(data) {
        console.log(data.name + ' submitted a word, checking...');
        fs.readFile('./session/game.json', function(err, jData) {
            if (err) {
                console.log(err);
            }

            if (jData) {
                var parsed = JSON.parse(jData);
                if (parsed['boggled'].indexOf(data.word) > -1) {
                    for (var i = 0; i < parsed['players'].length; i++) {
                        if (parsed['players'][i].name == data.name) {
                            if (parsed['players'][i].words.indexOf(data.word) == -1) {
                                console.log(data.name + ' found a word, ' + data.word + '!');
                                parsed['players'][i].points += data.word.length;
                                parsed['players'][i].words.push(data.word);
                                console.log('updated server-side game information');
                                fs.writeFile('./session/game.json', JSON.stringify(parsed, null, '\t')); //also, include null and '\t' arguments to keep the data.json file indented with tabs
                            }
                            else {
                                socket.emit('_incorrect-word', 'You already found this word- good job!');
                            }
                        }
                    }
                    if (true) {
                        updateClients(parsed);
                    }
                } else {
                    socket.emit('_incorrect-word', 'Did not find this word.. maybe the letters are not connected?');
                }
            }
        });
    });
    socket.once('_time-up', function() {
        fs.readFile('./session/game.json', function(err, jData) {
            if(err) {
                console.log(err);
            }
            if (jData) {
                var parsed = JSON.parse(jData);
                console.log(jData);
                if(parsed['players'][0].points > parsed['players'][1].points) {
                    socket.emit('_winner-and-end', parsed['players'][0].name);
                }
                else {
                    socket.emit('_winner-and-end', parsed['players'][1].name);
                }
                parsed = Game;
                fs.writeFile('./session/game.json', JSON.stringify(parsed, null, '\t')); //also, include null and '\t' arguments to keep the data.json file indented with tabs
            }
        });
    });
    socket.on('disconnect', function() {
        console.log('user disconnected');
        socket.broadcast.emit('_user-disconnect');
        fs.readFile('./session/game.json', function(err, jData) {
            if (err) {
                console.log(err);
            }
            if(jData) {
                var parsed = JSON.parse(jData);
                parsed = Game;
                fs.writeFile('./session/game.json', JSON.stringify(parsed, null, '\t')); //also, include null and '\t' arguments to keep the data.json file indented with tabs
            }
        });
    });
});
