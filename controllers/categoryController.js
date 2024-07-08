const Category = require('../model/categoryModel')
const Admin = require('../model/adminModel')
const multer = require('multer')
const categoryModel = require('../model/categoryModel')




const loadCategory= async(req,res)=>{
try {

    
    const categories=await Category.find({})
   
    console.log('categories',categories)

    res.render('admin/allCategory',{categories:categories})
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
        console.log('req.body',req.body);
        console.log(req.files)
        await Category.create({
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
        console.log('load edit cat')
        const id=req.query.id
        const category=await Category.findOne({_id:id})
        console.log('category',category)

        res.render('admin/editCategory',{category:category})
    } catch (error) {
        console.log(error.message);
    }
}
const editCat = async(req,res)=>{
    try {
        console.log('entered edit cat')
       console.log(req.body);
        const id=req.body.id
        console.log('id',id);
        const updatedCategory = await Category.findByIdAndUpdate(
            {_id:id},
            {
                catName: req.body.catName,
                description:req.body.description,
                image: req.body.image,
                image: req.file ? req.file.filename : null
            },
            { new: true } 
        );
        console.log('category',updatedCategory)
    
        const categories=await Category.find({})

        res.render('admin/allCategory',{categories:categories})
    } catch (error) {
        console.log(error.message);
    }
}

const catBlock = async(req,res)=>{
    try {
        const catId = await categoryModel.findOne({_id:req.body.id})
        catId.is_Blocked=!catId.is_Blocked
        await catId.save()
        
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