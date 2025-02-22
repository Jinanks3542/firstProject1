const express = require("express");
const  mongoose=require("mongoose");

const orderSchema= new mongoose.Schema({
    
    // OrderId:{
    //     type:Number,
    //     required:true
    // },
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    orderAmount:{
        type:Number,
        required:true
    },
    deliveryAddress:{
        name:{type:String, required:true },
        phone:{type:Number,required:true},
        pincode:{type:Number,required:true},
        street:{type:String,required:true},
        city:{type:String,required:true},
        state:{type:String,required:true},
        locality:{type:String,required:true},
    },
    payment:{
        type:String,
        enum: ['Online Payment','Cash on Delivery','Wallet'], 
        required: true,
    },
    orderDate: {
        type: Date,
        required: true,
    },
    offer:{
        type:Number,
        default:0
    },
    paymentStatus:{
      type:String,
      enum:['Paid','Pending'],
      default:'Pending'
    },

         products:[{

            productId:{
              type:mongoose.Schema.Types.ObjectId,
              ref:"Product",
              required:true
            },
            quantity:{
                type:Number,
                required:true,
                default:1,
            }, 
            productPrice:{
                type:Number
            },
               ProductStatus: {
                type: String,
                enum: ['Ordered', 'Shipped', 'Delivered','Canceled','Return'], 
                default: 'Ordered'
             },
            returnReason:{
                type : String,
                 default : ''
            },

        }],

       
})





module.exports=mongoose.model('Order',orderSchema)