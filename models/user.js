const mongoose= require('mongoose');
const passport= require('passport');
const plm=require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

const UserSchema= new mongoose.Schema(({
    displayName:String,
    phone:String,
    address:String,
    postcode:String,
    province:String,
    avatar:String,
   // image:String,
    resetPasswordToken:String,
    resetPasswordExpires:Date
}));

UserSchema.plugin(plm);
UserSchema.plugin(findOrCreate);

module.exports=mongoose.model('User',UserSchema);