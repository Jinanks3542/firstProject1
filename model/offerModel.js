const  mongoose=require("mongoose");

const offerSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    offer:{
        type:Number,
        required:true
    }
})

module.exports=mongoose.model('Offer',offerSchema)