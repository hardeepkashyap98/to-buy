// reference mongoose
const mongoose = require('mongoose');

//note schema
const listingSchema= new mongoose.Schema({
    name:String,
    description:String,
    username: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    price:Number,
    SellPrice:Number,
    condition:String,
    Brand:String,
    image:String,
    category:String,
    active:Boolean,
    love:[{
        userId:String
    }],
    offer:[{
        price:Number,
        message:String,
        username:String,
        userAvatar:String,
        userId:String,
        offerDate:Date,
        accept:Boolean
    }],
    dealStatus:String,
    timeStamp: {type:Date,default:Date.now},
    review:[{
        userId:String,
        username:String,
        userAvatar:String,
        message:String,
        timeStamp:Date,

    }],
});

module.exports= mongoose.model('Listing',listingSchema);