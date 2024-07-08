const mongoose=require('mongoose')
const brandSchema=new mongoose.Schema({
    brandName:{
        type:String,
        required:true
    },  
    description:{
     type:String,
     required:true
    },
    is_Blocked:{
        type:Boolean,
        default:false
    }
       
    

})

module.exports=mongoose.model('Brand',brandSchema)