var express = require('express');
var bcryot = require('bcryptjs');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/NomadBNBv2');
var listing = require('./models/listing');
var user = require('./models/user');
var Listing = mongoose.model('Listing');
var listing = require('./models/listing');
var booking = require('./models/bookings');
var Booking = mongoose.model('Booking');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var home = require('./routes/home');
var booking = require('./routes/booking');

//Init app
var app = express();

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

//body parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}))
app.use(cookieParser());

//Set static folder 
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public/images')));

//Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//Passport Init
app.use(passport.initialize());
app.use(passport.session());

//Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
        
        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param: formParam,
            msg  : msg,
            value : value
        }
    }
}));

//Connect flash
app.use(flash());

//Global Vars
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/home', home);
app.use('/bookings', booking);

app.get("/bookings/new", function(req, res) {
    if (req.session.user) {
      require('url').parse("/booking/new", true);
      Listing.findById(req.query.id, function(err, listing) {
        req.session.listing = listing;
        req.session.save();
        res.render("bookings/new", { listing })
      });
    }
    else {
      res.redirect("/users/login");
    }
  });
  
  app.post("/bookings/new", function(req, res) {
    Listing.findById(req.session.listing, function(err, currentListing) {
      Booking.create({bookingDate: currentListing.available,
                      confirmed: false,
                      rejected: false,
                      totalPrice: currentListing.price,
                      listing: currentListing,
                      listingName: currentListing.name,
                      listingOwner: currentListing.owner,
                      requester: req.session.user,
                      requesterName: req.session.user.name
                      }),
        function (err, booking) {
          if (err) {
            res.send("There was a problem adding the information to the database.");
          } else {
            console.log('New booking has been created');
          }
        };
        res.redirect("/bookings");
    });
  });
  
  app.get("/bookings", function(req, res) {
    Booking.find({'requester': req.session.user}, function(err, bookings) {
      Booking.find({}).where('requester').equals(req.session.user).exec(function(err, myBookings) {
        Booking.find({}).where('listingOwner').equals(req.session.user).exec(function(err, receivedBookings) {
            res.render("bookings/index", { myBookings, receivedBookings });
        });
      });
    });
  })

  app.get('/bookings/complete', function(req, res) {
    if (req.query.action === "confirm") {
      Booking.findById(req.query.booking_id, function(err, currentBooking) {
        Booking.findOneAndUpdate({ _id: currentBooking._id }, {$set: { confirmed: true } }, {new: true}, function(err, booking) {});
        Booking.find({}).where('listing').equals(currentBooking.listing).where('confirmed').equals(false).where('rejected').equals(false).exec(function(err, bookings) {
          bookings.forEach(function(booking) {
            Booking.findOneAndUpdate({ _id: booking._id }, {$set: { rejected: true } }, {new: true}, function(err, booking) {
            });
          });
          res.redirect('/bookings');
          Listing.findOneAndUpdate({ _id: currentBooking.listing }, {$set: { booking: currentBooking } }, {new: true}, function(err, listing) {});
        });
      })
    }
    else if (req.query.action === "reject") {
      Booking.findOneAndUpdate({ _id: req.query.booking_id }, {$set: { rejected: true } }, {new: true}, function(err, booking) {} );
      res.redirect('/bookings');
    }
  });

  app.get("/listings/new", function (req, res) {
    if (req.session.user) {
      res.render("listings/new", {});
    }
    else {
      res.render("listings/new", {});
      // res.redirect("/users/login");
    }
  });
  
  app.post("/listings", function (req, res) {
    Listing.create({name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    available: req.body.available,
                    booking: null,
                    owner: req.session.user
                  }),
      function (err, listing) {
        if (err) {
          res.send("There was a problem adding the information to the database.");
        } else {
          console.log('New listing has been created');
        }
      };
    res.redirect("/listings");
  });
  
  app.get("/listings", function(req, res) {
    if (req.session.filter_date) {
      Listing.find({}).where('available').equals(req.session.filter_date).where('booking').equals(null).exec(function(err, listings) {
        res.render("listings/index", { listings });
      });
    } else {
      res.render("listings/index", { listings: null });
    }
  });

  app.get('/listings_filter', function(req, res){
    req.session.filter_date = req.query.filter_date;
    Listing.find({}).where('available').equals(req.session.filter_date).where('booking').equals(null).exec(function(err, listings) {
      res.render("listings/index", { listings });
    });
  });


//set port
app.set('port', (process.env.PORT || 4000));

app.listen(app.get('port'), function() {
   console.log('server started on port ' + app.get('port')); 
});