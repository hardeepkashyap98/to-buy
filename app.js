var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('connect-flash');

//references added
const mongoose = require('mongoose');
const config= require('./config/global');
//const functions =require('./config/functions');
//auth packages
const passport =require('passport');
const session = require('express-session');
const localStrategy =require('passport-local').Strategy;
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var indexRouter = require('./controllers/index');
var usersRouter = require('./controllers/users');
var chats=require('./controllers/chats');
var notes=require('./controllers/notes');

//db connection
mongoose.connect(config.db,{ useNewUrlParser: true, useCreateIndex: true});
//passport config
app.use(session({
    secret:'any thing for salting here',
    resave:true,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

// reference User model

const User= require('./models/user');
passport.use(User.createStrategy());
// google auth strategy
passport.use(new googleStrategy({
        clientID: config.google.googleClientId,
        clientSecret: config.google.googleClientSecret,
        callbackURL: config.google.googleCallbackUrl,
        profileFields: ['id', 'emails']
    },
    (accessToken, refreshToken, profile, done) => {
     //console.log(profile);
        User.findOne({username: profile.emails[0].value},(err,user)=>{

            if(user){
                return done (err, user);
            }
            else{
                User.create({
                    username: profile.emails[0].value,
                    displayName: profile.name.givenName + profile.name.familyName
                },(err,user)=>{
                    return done (err, user);
                })
            }

        })
     //    User.findOrCreate({
     //        username: profile.emails[0].value,
     //        displayName: profile.name.givenName + profile.name.familyName
     //    }, (err, user) => {
     //        return done (err, user);
     //    });
    }
));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chats', chats);
app.use('/notes', notes);


// server.listen(port, function(){
//     console.log('listening on port ' + port);
//
//     io.on('connection', function (socket) {
//         console.log("USER CONNECTED...");
//
//         // handle new messages
//         socket.on('new:message', function (msgObject) {
//             io.emit('new:message', msgObject);
//         });
//
//         // handle new members
//         socket.on('new:member', function (name) {
//             io.emit('new:member', name);
//         });
//     });
// });

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
