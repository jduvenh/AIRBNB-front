var express = require('express');
var router = express.Router();

router.get('/', ensureAuthenticated, function(req, res) {
    res.render('index');
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
       return next();
    } else {
        //Take this line out if you dont want the error to show up
        // req.flash('error_msg','Sorry you are not logged in');
        
        
        res.redirect('/home/home');
    }
}

module.exports = router;