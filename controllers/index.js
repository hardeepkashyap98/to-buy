var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Listing = require('../models/listing');
var async        =  require("async");
var nodemailer   =  require("nodemailer");
var crypto       =  require("crypto");
let date = require('date-and-time');
const fs  =  require('fs-extra');
var contents  =  fs.readFileSync("record.txt");
var Record    =  JSON.parse(contents);
const xoauth2 =require('xoauth2');
var multer = require('multer');
const functions =require('../config/functions');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/user');
    },
    filename: function(req, file, cb) {
        cb(null,  file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});
/* GET home page. */
router.get('/', function(req, res, next) {
    // Listing.find().sort({_id:-1}).limit(6).exec((err,listings)=>{
    //     console.log(listings)
    //     res.render('index', {
    //         title: 'Like Buy',
    //         user:req.user,
    //         Listings:listings});
    //
    // })
    // let category;
    let ftlistings = [];
    Listing.find({active:true})
        .populate('username')
        .sort({_id:-1})
        .limit(9)
        .exec()
        .then(listings=>{
            if(req.user){
                for (let x=0;x<listings.length;x++){
                    for(let y=0;y<listings[x].love.length;y++) {
                        if (listings[x].love[y].userId == req.user._id) {

                            ftlistings.push(listings[x]._id);

                        }
                    }
                }
                console.log(ftlistings);
                res.render('index', {
                    title: 'index',
                    Listings:listings,
                    user:req.user,
                    ftlistings:ftlistings

                })
            }else{
                res.render('index', {
                    title: 'index',
                    Listings:listings,
                    user:req.user,
                    ftlistings:''

                })

            }



        })

});
router.get('/profile', function(req, res, next) {
    res.render('profile', {
        title: 'Like Buy',
        user:req.user,
        passwordChange:req.flash('passwordChange'),
        err:req.flash('err'),});
});
router.post('/profile', function(req, res, next) {

    User.updateOne({username:req.user.username},
        {$set:{
                displayName:req.body.displayName,
                address:req.body.address,
                province:req.body.province,
                phone:req.body.phone,
                postcode:req.body.postcode
            }},null,(err)=>{
            if(err){
                console.log(err);
            }
            else{
                res.redirect('/profile');
            }

        });
});
router.post('/userAvatar',upload.single('avatar'), function(req, res, next) {
    console.log(req.file);
    User.updateOne({username:req.user.username},
        {$set:{
                avatar:req.file.originalname,
            }},null,(err)=>{
            if(err){
                console.log(err);
            }
            else{
                res.redirect('/profile');
            }

        });
});
router.get('/login', ( req, res, next ) => {
    // check for invalid login message in the session object
    let messages = req.session.messages || [];

    // clear the session messages
    req.session.messages = [];
    res.render('login', {
        title: 'Login',
        user: req.user,
        error:req.flash('error'),
        successChange:req.flash('successChange')

    });
});


router.post('/login', passport.authenticate('local',{
    successRedirect: '/',
    failureFlash:true,
    failureFlash: 'Invalid username or password!!',
    failureRedirect: '/login'

}));

// GET: /logout
router.get('/logout', (req, res, next) => {

    // clear out any session messages
    req.session.messages = [];

    // end the user's session
    req.logout();

    // redirect to login or home
    res.redirect('/login');
});
router.get('/password',(req,res,next)=>{
   res.render('password',{
       title: 'Like Buy',
       user:req.user,
       passwordChange:req.flash('passwordChange'),
       err:req.flash('err'),
   })
});
router.post('/password',function(req, res, next) {


    if(req.body.password === req.body.confirm){
        // console.log('it is working');
        req.user.changePassword(req.body.oldpassword, req.body.password, function(err){
            if(err){
                req.flash('err', 'Your old password is incorrect!');
                res.redirect('/password');
                // console.log(err.message);

            }else {
                req.flash('passwordChange', 'Your Password has been reset!');
                res.redirect('/password');
            }
        })

    }else {
        req.flash('err', 'Please enter same new password!!');
        res.redirect('/password');

    }

});

router.get('/register', (req, res, next) => {
    res.render('register', {
        title: 'Register',
        user: req.user,
        error:'',
    });
});
router.post('/register',(req, res, next) => {
    // create the new User with our model
    if( req.body.password != req.body.comfirm ) {
        res.render('register', {
            title: 'Register',
            error: 'Passwords do not match',
        });
    } else {
        User.find( ( err, users ) => {
            if ( err ) {

            } else {
                for( let i = 0; i < users.length; i++ ) {
                    if ( users[i].username == req.body.username ) {
                        res.render('register', {
                            title: 'Register',
                            error: 'The email is already registered',

                        });
                    } else {
                        User.register(new User({
                            username: req.body.username,
                            displayName: req.body.displayName,
                            phone: req.body.phone
                        }), req.body.password, ( err, user ) => {
                            if( err ) {
                                console.log(err);
                            } else {
                                req.flash('successChange', 'Your account is successfully registered!');
                                res.redirect('/login');
                            }
                        });
                    }
                }
            }
        })
    }
});

//Get forgot
router.get('/forget',(req,res,next)=>{
    res.render('forget', {
        title:'',
        error:req.flash('error'),
        success:req.flash('success')
    });
});
//post a reset link to your email
router.post('/forget', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ username: req.body.username }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forget');
                }

                user.resetPasswordToken = token;
                console.log(user.resetPasswordToken);
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({

                service:'gmail',

                host:'smtp.gmail.com',
                auth:{
                    type: "OAuth2",
                    user:'ericxiongyachao@gmail.com',
                    clientId:'939968225981-jrsliq961cam1gnvl5067b7ndmro3aab.apps.googleusercontent.com',
                    clientSecret:'LZXGN3tSsghXWoKMoTFxr0HG',
                    refreshToken:'1/zsMG9PU3olwSd8szUeKwTH51dmlthXB5VRrIKKl-wHQ',

                }
            });
            var mailOptions = {
                to: user.username,
                from: 'Like Buy  Password Reset<LikeBuy@resetPassword.com>',
                subject: 'Like Buy Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n\n'+
                'Like Buy,\n\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'An e-mail has been sent to ' + user.username);
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forget');
    });
});

router.get('/reset/:token',(req,res,next)=>{
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {
            title:'',
            error:req.flash('error'),
            token: req.params.token
        });
    });
});
router.post('/reset/:token', (req, res,next)=>{
    async.waterfall([
            function(done) {
                User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                    if (!user) {
                        req.flash('error', 'Password reset token is invalid or has expired.');
                        return res.redirect('back');
                    }
                    if(req.body.password === req.body.confirm) {
                        user.setPassword(req.body.password, function(err) {
                            user.resetPasswordToken = undefined;
                            user.resetPasswordExpires = undefined;

                            user.save(function(err) {
                                req.logIn(user, function(err) {
                                    done(err, user);
                                });
                            });
                        })
                    } else {
                        req.flash("error", "Passwords do not match.");
                        return res.redirect('back');
                    }
                });
            },
            function(user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service:'gmail',

                    host:'smtp.gmail.com',
                    auth:{
                        type: "OAuth2",
                        user:'ericxiongyachao@gmail.com',
                        clientId:'188051741598-7lfo42fio89cvcvdvkmh8k46f8ged1c7.apps.googleusercontent.com',
                        clientSecret:'ZolN8v3Vqiwn9HySjjvI7Wr4',

                        refreshToken:'1/aljU62a-Eepnt0UdPSQbEbbz2w9x95sH8q7CD_-6Cqs'

                    }
                });
                var mailOptions = {
                    to: user.username,
                    from: 'Like Buy Password Reset<Like Buy@resetPassword.com>',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'+
                    'Like Buy,\n\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    req.flash('successChange', 'Success! Your password has been changed.');
                    done(err);
                });
            }
        ],
        function(err) {
            res.redirect('/login');
        });
});

// GET: /google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// GET: /google/callback
router.get('/google/callback', passport.authenticate('google', {
        // failed google auth
        failureRedirect: '/login',
        failureMessage: 'Invalid Login',
        scope: 'email'
    }),
    // successful google auth
    (req, res, next) => {
        res.redirect('/');
    }
);
router.get('/category', (req, res, next) => {
    let category;
    let ftlistings = [];
       Listing.find({active:true})
           .populate('username')
           .exec()
           .then(listings=>{
               if(req.user){
                   for (let x=0;x<listings.length;x++){
                       for(let y=0;y<listings[x].love.length;y++) {
                           if (listings[x].love[y].userId == req.user._id) {

                               ftlistings.push(listings[x]._id);

                           }
                       }
                   }
                   console.log(ftlistings);
                   res.render('category', {
                       title: 'Category',
                       Listings:listings,
                       user:req.user,
                       Category:category,
                       ftlistings:ftlistings

                   })
               }else{
                   res.render('category', {
                       title: 'Category',
                       Listings:listings,
                       user:req.user,
                       Category:category,
                       ftlistings:''

                   })

               }



           })

});
router.post('/search', (req, res, next) => {
    let category;
    let ftlistings = [];
    Listing.find({active:true,name: {$regex:req.body.Search,$options:'i'}})
        .populate('username')
        .exec()
        .then(listings=>{
            if(req.user){
                for (let x=0;x<listings.length;x++){
                    for(let y=0;y<listings[x].love.length;y++) {
                        if (listings[x].love[y].userId == req.user._id) {

                            ftlistings.push(listings[x]._id);

                        }
                    }
                }
                console.log(ftlistings);
                res.render('category', {
                    title: 'Category',
                    Listings:listings,
                    user:req.user,
                    Category:category,
                    ftlistings:ftlistings

                })
            }else{
                res.render('category', {
                    title: 'Category',
                    Listings:listings,
                    user:req.user,
                    Category:category,
                    ftlistings:''

                })

            }



        })

});
router.get('/categoryOne/:category', (req, res, next) => {
    let ftlistings = [];
   let category=req.params.category;
    console.log(category);
    Listing.find({active:true,category:category})
        .populate('username')
        .exec()
        .then(listings=>{
            if(req.user){
                for (let x=0;x<listings.length;x++){
                    for(let y=0;y<listings[x].love.length;y++) {
                        if (listings[x].love[y].userId == req.user._id) {

                            ftlistings.push(listings[x]._id);

                        }
                    }
                }
                console.log(listings);
                res.render('category', {
                    title: 'Category',
                    Listings:listings,
                    user:req.user,
                    Category:category,
                    ftlistings:ftlistings
                })
            }else{

                res.render('category', {
                    title: 'Category',
                    Listings:listings,
                    user:req.user,
                    Category:category,
                    ftlistings:''
                })


            }

        })
});

router.get('/productDetails', (req, res, next) => {
    res.render('productDetails', {
        title: 'productDetails',
        user:req.user
    });
});
router.get('/ads', (req, res, next) => {
    Listing.find({username:req.user._id},(err,listings)=>{

        res.render('ads', {
            title: 'ads',
            user:req.user,
            date:date,
            Listings:listings
        });
    })

});
router.get('/ad-done', (req, res, next) => {

    Listing.find({active:false,dealStatus:'Archeved',username:req.user._id},(err,listings)=>{
        res.render('ad-done', {
            title: 'ad-done',
            user:req.user,
            Listings:listings,
            date:date
        });
    })
});
router.get('/:_id/archeved', (req, res, next) => {
    let _id    = req.params._id;
    Listing.findById({_id:_id},(err,listing)=>{
        res.render('archeved-details', {
            title: 'ad-archeved-details',
            user:req.user,
            listing:listing,
            date:date
        });
    })
});

router.get('/ad-favourite', (req, res, next) => {
    Listing.find({'love.userId':req.user._id},(err,listings)=>{
        console.log(listings);
        res.render('ad-favourite', {
            title: 'ad-favourite',
            user:req.user,
            Listings:listings,
            date:date
        });
    })

});
router.get('/:_id/addToFavourite/:userID',(req,res,next)=>{
    let _id    = req.params._id;
    let userID = req.params.userID;

    Listing.findByIdAndUpdate({ _id: _id },{ $push: { love:{'userId':userID} }},
        {upsert: true},
        function(err, doc) {
            if(err){
                console.log(err);
            }else{
                res.json(doc);
            }
        }
    );
})
// router.get('/:_id/deleteToFavourite/:userID',(req,res,next)=>{
//     let _id    = req.params._id;
//     let userID = req.params.userID;
//
//     Listing.findByIdAndUpdate({ _id: _id },{ $pull: { love:{'userId':userID} }},
//         {upsert: true},
//         function(err, doc) {
//             if(err){
//                 console.log(err);
//             }else{
//                 res.json('delete it');
//             }
//         }
//     );
// })
router.get('/:_id/removeFavourite/:userID',(req,res,next)=>{
    let _id    = req.params._id;
    let userID = req.params.userID;

    Listing.findByIdAndUpdate({ _id: _id },{ $pull: { love:{'userId':userID} }},
        {upsert: true},
        function(err, doc) {
            if(err){
                console.log(err);
            }else{
                res.redirect('/ad-favourite');
            }
        }
    );
})
router.get('/ad-pending', (req, res, next) => {
    Listing.find({active:true,dealStatus:'Pending',username:req.user._id},(err,listings)=>{
        res.render('ad-pending', {
            title: 'ad-pending',
            user:req.user,
            listings:listings,
            date:date
        });
    })

});
router.get('/listing',functions.isLoggedIn, (req, res, next) => {
    res.render('listing', {
        title: 'listing',
        user:req.user
    });
});
router.post('/listing',functions.isLoggedIn,upload.single('image') ,(req, res, next) => {
    Listing.create({
        name:req.body.name,
        description:req.body.description,
        username: req.user._id,
        price:req.body.price,
        SellPrice:req.body.SellPrice,
        condition:req.body.condition,
        Brand:req.body.Brand,
        category:req.body.category,
        active:req.body.active,
        image:req.file.originalname,
        timeStamp: req.body.timeStamp,
    },(err,listing)=>{
        if(err){
           console.log(err);
        }else {
            res.redirect('/ads');
        }

    })
});

router.get('/:_id/listingDetails',(req,res,next)=>{
    let _id= req.params._id;
    Listing.findById({_id:_id})
        .populate('username')
        .exec()
        .then(listing=>{
            //console.log(listing);
            res.render('listingDetails', {
                title: 'listingDetails',
                listing:listing,
                user:req.user,
                date:date,
                error:req.flash('error'),
                success:req.flash('success')
            })
        })
});
router.post('/:_id/listingDetails',functions.isLoggedIn,(req,res,next)=>{
    let _id= req.params._id;
    let offerD= new Date();
    Listing.findById({_id:_id})
        .populate('username')
        .exec()
        .then(listing=>{
            if(req.user._id .equals(listing.username._id) ){
                console.log(listing)
                req.flash('error','Can not make the offer to yourself!');
                res.redirect(`/${_id}/listingDetails`);
            }else{
                Listing.findOneAndUpdate({ _id: _id },{$push: {
                            offer: {
                                price: req.body.price,
                                message: req.body.message,
                                username: req.user.displayName,
                                userAvatar: req.user.avatar,
                                userId: req.user._id,
                                offerDate: offerD,
                            }
                        }},
                    function(err, doc) {
                        if(err){
                            console.log(err);
                        }else{
                            /***********************************************************/
                            var smtpTransport = nodemailer.createTransport({

                                service:'gmail',

                                host:'smtp.gmail.com',
                                auth:{
                                    type: "OAuth2",
                                    user:'ericxiongyachao@gmail.com',
                                    clientId:'939968225981-jrsliq961cam1gnvl5067b7ndmro3aab.apps.googleusercontent.com',
                                    clientSecret:'LZXGN3tSsghXWoKMoTFxr0HG',
                                    refreshToken:'1/zsMG9PU3olwSd8szUeKwTH51dmlthXB5VRrIKKl-wHQ',

                                }
                            });
                            var mailOptions = {
                                to:listing.username.username ,
                                from: `ToBuy Offer`,
                                subject: `New ToBuy Offer`,
                                text: 'Hello,\n\n' +
                                'You have a New Offer .\n\n'+
                                'Email: '+req.user.username+'\n\n'+
                                'Price: '+req.body.price+'\n\n'+
                                'Message: '+req.body.message+'\n\n'+
                                'ToBuy ,\n\n'
                            };
                            smtpTransport.sendMail(mailOptions, function(err) {
                                doc.dealStatus='Pending';
                                doc.save();
                                req.flash('success','The offer was sent successfully!')
                                res.redirect(`/${_id}/listingDetails`);
                            });

                            /***********************************************************/

                        }
                    }
                );
            }
        })

});

router.get('/:_id/listingUpdate',(req,res,next)=>{
    let _id= req.params._id;
    Listing.findById({_id:_id})
        .populate('username')
        .exec()
        .then(listing=>{
            console.log(listing);
            res.render('listingUpdate', {
                title: 'listingUpdate',
                listing:listing,
                user:req.user,
                date:date
            })
        })
});
//update
router.post('/:_id/listingUpdate',(req,res,next)=>{
    let _id= req.params._id;
    let Newdate= new Date();
   Listing.update({_id:_id},
       {$set:{
           name:            req.body.name,
           description:     req.body.description,
           price:           req.body.price,
           SellPrice:       req.body.SellPrice,
           condition:       req.body.condition,
           Brand:           req.body.Brand,
           category:        req.body.category,
           active:          req.body.active,
           timeStamp:       Newdate

       }},null,(err)=>{
       if(err){
           console.log(err);
       }
       else{
           res.redirect('/ads');
       }

   })
});
router.get('/:_id/userProfile',(req,res,next)=>{
    let _id= req.params._id;
    User.findById({_id:_id},(ERR,userProfile)=>{
        res.render({
            user:req.user,
            userProfile:userProfile,

        })
    })
});
router.get('/listing/:_id/delete',(req,res,next)=>{
    let _id= req.params._id;
    Listing.remove({_id:_id},(ERR)=>{
        if(ERR){

        }else {
            res.redirect('/ads');
        }

    })
});

router.get('/:_id/offers',(req,res)=>{
    let _id= req.params._id;
    Listing.findById(_id,(err,listing)=>{
        res.render('offers',{
            user:req.user,
            title:'Offers',
            listing:listing,
            date:date
        })

    })


});
router.get('/:_id/:_number/offers/accept',(req,res,next)=>{
    let _id= req.params._id;
    let number=req.params._number;
    Listing.findById(_id,(err,listing)=>{
        listing.offer[number].accept=true;
        listing.dealStatus="Archeved";
        listing.active=false;
        listing.save();
        res.redirect('/ad-pending');
    })
});
router.get('/:_id/:_offerId/offers/delete',(req,res,next)=>{
    let _id= req.params._id;
    let _offerId=req.params._offerId;

    Listing.findByIdAndUpdate({ _id: _id },{ $pull: { offer:{_id:_offerId} }},
        {upsert: true},
        function(err, doc) {
            if(err)console.log(err);
        }).then(doc=>{

        if(doc.offer.length>0){
            res.redirect(`/${_id}/offers`);

        }else {
            doc.dealStatus='';
            doc.save();
            res.redirect(`/ad-pending`);
        }

    });
});

router.post('/:_id/review',functions.isLoggedIn,(req,res,next)=>{
    let _id= req.params._id;
     Listing.findOneAndUpdate({_id},{$push:{review:{
             message: req.body.review,
             username: req.user.displayName,
             userAvatar: req.user.avatar,
             userId: req.user._id,
                 timeStamp: new Date(),

         }}},(err,listing)=>{
     if(err)console.log(err)
     res.redirect(`/${_id}/listingDetails`);


 })

});
router.get('/:_id/collection',(req,res,next)=>{
    let _id=req.params._id;

  User.findById(_id,(err,seller)=>{
      Listing.find({username:_id},(err,listings)=>{
          console.log(seller)
          res.render('collection',{
              seller:seller,
              user:req.user,
              listings:listings,
              date:date,
              success:req.flash('success')
          })
      })

  })


});
//contact from profile collection page
router.post('/:_id/:_email/contact',(req,res,next)=>{
    let email=req.params._email;
     let _id=req.params._id;
    var smtpTransport = nodemailer.createTransport({

        service:'gmail',

        host:'smtp.gmail.com',
        auth:{
            type: "OAuth2",
            user:'ericxiongyachao@gmail.com',
            clientId:'939968225981-jrsliq961cam1gnvl5067b7ndmro3aab.apps.googleusercontent.com',
            clientSecret:'LZXGN3tSsghXWoKMoTFxr0HG',
            refreshToken:'1/zsMG9PU3olwSd8szUeKwTH51dmlthXB5VRrIKKl-wHQ',

        }
    });
    var mailOptions = {
        to: email,
        from: `ToBuy Contact`,
        subject: `${req.body.title}`,
        text: 'Hello,\n\n' +
        'You have a message .\n\n'+
        'Email: '+req.body.email+'\n\n'+
        'Message: '+req.body.message+'\n\n'+
        'ToBuy Contact,\n\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'An e-mail has been sent successfully!');
        res.redirect(`/${_id}/collection`)
    });

})
//contact from details page
router.post('/:_id/:_email/contact2',(req,res,next)=>{
    let email=req.params._email;
    let _id=req.params._id;
    var smtpTransport = nodemailer.createTransport({

        service:'gmail',

        host:'smtp.gmail.com',
        auth:{
            type: "OAuth2",
            user:'ericxiongyachao@gmail.com',
            clientId:'939968225981-jrsliq961cam1gnvl5067b7ndmro3aab.apps.googleusercontent.com',
            clientSecret:'LZXGN3tSsghXWoKMoTFxr0HG',
            refreshToken:'1/zsMG9PU3olwSd8szUeKwTH51dmlthXB5VRrIKKl-wHQ',

        }
    });
    var mailOptions = {
        to: email,
        from: `ToBuy Contact`,
        subject: `${req.body.title}`,
        text: 'Hello,\n\n' +
        'You have a message .\n\n'+
        'Email: '+req.body.email+'\n\n'+
        'Message: '+req.body.message+'\n\n'+
        'ToBuy Contact,\n\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'An e-mail has been sent successfully!');
        res.redirect(`/${_id}/listingDetails`)
    });

})

module.exports = router;
