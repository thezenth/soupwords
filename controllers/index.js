var express = require('express')
  , router = express.Router()

var fs = require('fs');

//models
var Game = require('../models/game').Game;
var Player = require('../models/player').Player;

//define other routes in other controller files, and then use form of
// app.use('/ROUTE', require('./ROUTE'))

router.get('/', function(req, res) {
    res.render('pages/index');
 });

 router.post('/', function(req, res) {
     res.render('pages/game'); //have to make this!
 })

module.exports = router
