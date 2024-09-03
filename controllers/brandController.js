const Brand = require('../model/brandModel')
const Admin = require('../model/adminModel')
const brandModel = require('../model/brandModel')


const loadBrand = async (req,res)=>{
    try {
   
        const brand = await Brand.find({})
        res.render('admin/allBrand',{brand})
    } catch (error) {
        console.log(error.message);
    }
}



const addBrand = async(req,res)=>{
    try {
        res.render('admin/addBrand')
    } catch (error) {
        console.log(error.message);
    }
}


const brandAdd = async(req,res)=>{
    try {
    
       await Brand.create({
         brandName:req.body.brandName,
         description:req.body.description
       })
       res.redirect('/admin/allBrand')
    } catch (error) {
        console.log(error.message);
    }
}


const editBrand = async(req,res)=>{
    try {
        const currentBrand = await brandModel.findOne({_id:req.query.id});
        res.send({currentBrand})
    } catch (error) {
        console.log(error.message);
    }
}

const brandEdited = async(req,res)=>{
    try {
        const {brandName,description,id}=req.body;
        await brandModel.findOneAndUpdate({_id:id},{$set:{brandName,description}});
        res.redirect('/admin/allBrand')
    } catch (error) {
       console.log(error.message); 
    }
}

const brandBlock = async(req,res)=>{
    try {
        
        const brandId = await brandModel.findOne({_id:req.body.id})
        brandId.is_Blocked=!brandId.is_Blocked
        const brand=await brandId.save()
        res.send({brand})
      
       
    } catch (error) {
        console.log(error.message);
    }
}






module.exports={
    loadBrand,
    addBrand,
    brandAdd,
    editBrand,
    brandEdited,
    brandBlock,
    
}