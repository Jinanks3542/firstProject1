const mongoose=require('mongoose')
const categorySchema=new mongoose.Schema({
    catName:{
        type:String,
        required:true
    },  
    description:{
     type:String,
    },
    is_Blocked:{
        type:Boolean,
        default:false
    },
    image:{
        type:String,
       
    }

})

module.exports=mongoose.model('Category',categorySchema)