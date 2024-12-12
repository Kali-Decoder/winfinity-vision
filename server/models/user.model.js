const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:false
    },
    wallet_address:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
        required:false
    },
    deposit:{
        type:Number,
        default:0
    },
});

const User=mongoose.model('USER',userSchema);
module.exports=User;