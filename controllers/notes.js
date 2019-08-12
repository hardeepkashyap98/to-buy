var express = require('express');
var router = express.Router();

const Note = require('../models/listing');

/* GET users listing. */
router.get('/', function(req, res, next) {


    Note.find((err, notes) => {
        if (err) {
        } else {
            res.render('Notes/index',{
                title: 'Notes',
                notes: notes,

            });

        }
    });
});
router.post('/', function(req, res, next) {

    Note.create({
        title:     req.body.title,
        content:   req.body.content,
        Date:      req.body.Date
    }, (err,device) => {
        if(err) {
            console.log(err);
        } else {

            res.redirect('/notes');

        }
    });
});
router.get('/delete/:_id',(req,res,next) => {
    let _id=req.params._id;
    Note.remove({_id:_id},(err) => {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/notes');
        }
    })
});
module.exports = router;