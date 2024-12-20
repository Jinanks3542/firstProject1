const Admin = require('../model/adminModel')
const multer = require('multer')
const categoryModel = require('../model/categoryModel')
const Offer = require('../model/offerModel')
const Product = require('../model/productModel')




const loadCategory= async(req,res)=>{
try {

    
    const categories=await categoryModel.find({})
    const catOffer = await Offer.find({})
 
    
   
    //console.log('categories',categories)

    res.render('admin/allCategory',{categories:categories, catOffer})
} catch (error) {
    console.log(error.message);
}
}

const addCategory = async(req,res)=>{
    try {
        res.render('admin/addCategory')
    } catch (error) {
        console.log(error.message);
    }
}
const categoryAdd = async(req,res)=>{
    try {
        // console.log('req.body',req.body);
        // console.log(req.files)
        await categoryModel.create({
            catName:req.body.catName,  
            description:req.body.description,
            image: req.file ? req.file.filename : null

        })
        res.redirect('/admin/allCategory') 
        
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditCategory = async(req,res)=>{
    try {
        //console.log('load edit cat')
        const id=req.query.id
        //console.log('id in load edit',id);
        
        const category=await categoryModel.findOne({_id:id})
        //console.log(category,'//////////////////////////////////');
        
        res.render('admin/editCategory',{category:category})
    } catch (error) {
        console.log(error.message);
    }
}
const editCat = async(req,res)=>{
    try {
        const id=req.body.id
        
        const imageId=req.body.image
        //console.log(imageId,'mmmmmmmmmmmmmmmmmmmmmmmmmmm');
        
        const updatedCategory = await categoryModel.findByIdAndUpdate(
            {_id:id},
            {$set:
            {
                catName: req.body.catName,
                description:req.body.description,
                image: req.body.image,
                image: req.file ? req.file.filename : imageId
            }},
            { new: true } 
        );
        //console.log('category',updatedCategory)
    
        const categories=await categoryModel.find({})
        const catOffer = await Offer.find({})

        res.render('admin/allCategory',{categories:categories,catOffer})
    } catch (error) {
        console.log(error.message);
    }
}

const catBlock = async(req,res)=>{
    try {
        const catId = await categoryModel.findOne({_id:req.body.id})
        catId.is_Blocked=!catId.is_Blocked;
        await catId.save()
        await Product.updateMany({categoryId:catId._id},{$set:{is_categoryBlocked:catId.is_Blocked}})
        res.json({success:true,  is_Blocked:catId.is_Blocked})
    } catch (error) {
        console.log(error.message);
    }
}












module.exports={
    loadCategory,
    addCategory,
    categoryAdd,
    loadEditCategory,
    editCat,
    catBlock,
}