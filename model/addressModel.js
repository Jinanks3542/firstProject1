const mongoose=require('mongoose')
const addressSchema = new mongoose.Schema({
  
    
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },

    address:[{
        name:{
            type:String,
            required:true,
        },
        street:{
            type:String,
            
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        locality:{
            type:String,
            required:true
        },
        phone:{
            type:Number,
            required:true
        },
        status:{
            type:Boolean,
            default:false
        },
        
    }],
    
})

module.exports=mongoose.model("Address",addressSchema)  
