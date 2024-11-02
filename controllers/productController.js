const path = require('path');
const fs = require('fs');
const productModel = require('../model/productModel')
const categoryModel = require('../model/categoryModel')
const brandModel = require('../model/brandModel')
const Admin = require('../model/adminModel');
const Offer = require('../model/offerModel')
const { log, error } = require('console');




const loadProduct = async (req, res) => {
    try {
        // for pagination

        const limit = 5
        const page = parseInt(req.query.page)||1
        const skip = (page-1) * limit
        const totlPrdctCount = await productModel.countDocuments()
        const totalPages = Math.ceil(totlPrdctCount/limit)

        const productLoad = await productModel.find({}).populate('categoryId').populate('brand').skip(skip).limit(limit).sort({_id:-1})
        const categoryData = await categoryModel.find()
        const offerApply = await Offer.find()
      

        res.render('admin/allProduct', {products :productLoad,categoryData,totalPages,  currentPage :page, offerApply })
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddProduct = async (req, res) => {
    try {
        const categories = await categoryModel.find({})
        const brand = await brandModel.find({})
        const offerApply = await Offer.find()
        
        console.log(categories);
        res.render('admin/addProduct', { categories, brand })
    } catch (error) {
        console.log(error.message);
    }
}

const productAdd = async (req, res) => {
    try {

        const { productName, description, category, price, stock,brand } = req.body
        console.log(brand);
        const productAdded = new productModel({
            productName: productName,
            description: description,
            categoryId: category,
            price: price,
            stock: stock,
            images: req.body.image,
            brand:brand,
            offerPrice:price
        })
        await productAdded.save()
        
        res.redirect('/admin/allProduct')
    } catch (error) {
        console.log(error.message);
    }
}

const productBlock = async (req, res) => {     
    try {
        
        const productId = await productModel.findOne({ _id: req.body.id })
        productId.is_blocked = !productId.is_blocked
        await productId.save()

        res.json({success:true, isBlocked: productId.is_blocked})
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false });
    }
}


const productExist = async (req, res) => {
    try {
        const name1 = req.body.productName.trim()
        const name = new RegExp(`^${name1}$`, "i");
        
        const existed = await productModel.findOne({ productName: name })
        if (existed) res.send({ exist: true });
        else res.send({ exist: false })

    } catch (error) {
        console.log(error.message);
    }
}

const LoadeditProduct = async (req, res) => {
    try {

        const Products = await productModel.findById({ _id: req.params.id })
        if (!Products) {
           return res.redirect('/admin/allProduct')
        }
        const categories = await categoryModel.find({})
        const brand = await brandModel.find({})
        res.render('admin/editProduct', { Products, categories, brand })
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/allProduct')
    }
}

const editProduct = async (req, res) => {
    try {
        const { id,productName, description, category, price, stock, image } = req.body
        const productAdded = await productModel.findOneAndUpdate({_id:id},{
            $set:{
                productName,
                description,
                categoryId:category,
                price,
                stock,
                images:image
            }
        })
        res.redirect('/admin/allProduct')
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadProduct,
    loadAddProduct,
    productAdd,
    productBlock,
    productExist,
    LoadeditProduct,
    editProduct,
}