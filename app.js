var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressEjs = require('express-handlebars');
var routes = require('./routes/index');
var userRoutes = require('./routes/users');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session); //to store session in mongo data base
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
//var users = require('./routes/users');

var app = express();

mongoose.connect('mongodb://localhost:27017/shopping');
require('./config/passport');
//console.log(passport);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.engine('.ejs',expressEjs({defaultLayout:'layout',extname:'.ejs'}))
app.set('view engine', '.ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(validator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    'secret':'mysupersecret',
    resave:false, //resave = true means we are storing/updating sessions on each request whether the sessions is updating or not
    saveinitialise:false, //saveinitialise = true means sessions will be stored if nothing is initialised
    store:new MongoStore({mongooseConnection: mongoose.connection}), //used to store sessions in mongodb
    cookie:{ maxAge:180 * 60 * 1000} //use to store the time period uptill which session will remain in mongodb
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session; //to access session in all views files without have to explicitly in all routes
    next();
});

//defining routes
app.use('/user', userRoutes);
app.use('/', routes);
//app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
