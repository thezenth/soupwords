var express = require('express'),
    router = express.Router()

var fs = require('fs');

//models
var Game = require('../models/game').Game;
var Player = require('../models/player').Player;

//define other routes in other controller files, and then use form of
// router.use('/ROUTE', require('./ROUTE'))

//Main/Index ====================================
router.get('/', function(req, res) {
    res.render('pages/index');
});

router.post('/', function(req, res) {
    res.redirect('/game')
})

//Game ==========================================
router.get('/game', function(req, res) {
    res.render('pages/game');
});

router.post('/game', function(req, res) {
    console.log('POST to /game')
})

module.exports = router;
