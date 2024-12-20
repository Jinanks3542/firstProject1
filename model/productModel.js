const mongoose = require('mongoose')
const { ObjectId, Timestamp } = require('mongodb');
const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images:[{
        type:String,
        required:true
    }],
    categoryId:{
        type:mongoose.Schema.ObjectId,
        ref:'Category',
        required:true
    },
    brand:{
        type:mongoose.Schema.ObjectId,
        ref:'Brand'
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    is_categoryBlocked:{
        type:Boolean,
        default:false
    },
    //offer details
    offer:{
        type:Number,
        default:0
       },
    offerPrice:{
        type:Number,
       }
     

})
module.exports = mongoose.model('Product', productSchema)