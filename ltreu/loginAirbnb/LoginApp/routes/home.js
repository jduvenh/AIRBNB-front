var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// var User = require('../models/home');

// home page
router.get('/home', function(req, res) {
    res.render('home');
});

module.exports = router;