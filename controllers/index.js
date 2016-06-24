var express = require('express')
  , router = express.Router()

//define other routes in other controller files, and then use form of
// app.use('/ROUTE', require('./ROUTE'))

router.get('/', function(req, res) {
    res.render('pages/index');
 });

 router.post('/', function(req, res) {
    //var new_user = req.body.newuser; 
 });

module.exports = router
