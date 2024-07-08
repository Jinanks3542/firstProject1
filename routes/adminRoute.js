const express = require('express');
const adminRoute =express();
const adminController = require('../controllers/adminController');
const session = require('express-session');
const categoryController = require('../controllers/categoryController')
const multer = require('../util/multer');
const upload = require('../util/multer');
const productController = require('../controllers/productController')
const brandController = require('../controllers/brandController')
const orderController = require('../controllers/orderController')






adminRoute.get('/',adminController.loginPage)
adminRoute.get('/login',adminController.loginPage)
adminRoute.post('/login',adminController.verifyLogin)
adminRoute.get('/logout',adminController.logout)
adminRoute.get('/home',adminController.loadHome)
adminRoute.get('/userList',adminController.allUsers)
adminRoute.put('/userList',adminController.userBlock)

// category related
adminRoute.get('/allCategory',categoryController.loadCategory)
adminRoute.get('/addCategory',categoryController.addCategory)
adminRoute.post('/addCategory',upload.single('image'),categoryController.categoryAdd)
adminRoute.get('/editCategory',categoryController.loadEditCategory)
adminRoute.post('/editCategory',upload.single('image'),categoryController.editCat)
adminRoute.patch('/categoryBlock',categoryController.catBlock)

// product related

adminRoute.get('/allProduct',productController.loadProduct)
adminRoute.get('/addProduct',productController.loadAddProduct)
adminRoute.post('/addProduct',productController.productAdd)
adminRoute.post('/productBlock',productController.productBlock)
adminRoute.put('/exist',productController.productExist)
adminRoute.get('/editProduct/:id',productController.LoadeditProduct)
adminRoute.post('/editProduct',productController.editProduct)

//brand related
adminRoute.get('/allBrand',brandController.loadBrand)
adminRoute.get('/addBrand',brandController.addBrand)
adminRoute.post('/addBrand',brandController.brandAdd)
adminRoute.put('/editBrand',brandController.editBrand)
adminRoute.post('/editBrand',brandController.brandEdited)
adminRoute.patch('/brandBlock',brandController.brandBlock)

// order related
adminRoute.get('/orderList',orderController.loadOrderList)
adminRoute.get('/singleOrder/:id',orderController.viewDetail)


module.exports=adminRoute


