const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    googleId:{
        type:String
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Address" 
    },

    coupons:[{

        couponId: { type: mongoose.Schema.Types.ObjectId, 
        ref:'Coupon' 
    },
    code:{
        type:String
    },
    couponStatus: {
        type: String,
        enum: ['Expired','Claimed','Claim'], 
        default: 'Claim'
     },
     expiryDate:{
        type:Date,
        required: true,
    },
    }],
    // refferalId:{
    //     type:String,
    //     required:true
    // },
    // refferalCodeSave:{
    //     type:String
    // }
})
module.exports = mongoose.model('User',userSchema)