const mongoose=require('mongoose')
const walletSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    balance:{
        type:Number,
         required:true,
         default:0
        },
    transaction:[{
        amount:{
            type:Number
        },
        date:{
            type: Date,
             default: Date.now 
            },
        creditOrDebit:{
            type:String,
            enum:['debit','credit','failed']
        }
    }]
})
module.exports=mongoose.model('Wallet',walletSchema)