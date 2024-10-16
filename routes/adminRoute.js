const express = require('express');
const adminRoute =express();
const adminController = require('../controllers/adminController');
const session = require('express-session');
const categoryController = require('../controllers/categoryController')
const multer = require('../util/multer');
const upload = require('../util/multer');
const auth=require('../middleware/userMiddleware')
const productController = require('../controllers/productController')
const brandController = require('../controllers/brandController')
const orderController = require('../controllers/orderController')
const offerController = require('../controllers/offerController')
const coupenController = require('../controllers/coupenController')






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
adminRoute.post('/updateStatus',orderController.updateStatus)
adminRoute.get('/returnRequest',adminController.loadReturnRequest)
adminRoute.patch('/returnApprove',orderController.returnApprove)

// Offer related
adminRoute.get('/allOffers',offerController.LoadOffer)
adminRoute.get('/addOffer',offerController.LoadAddOffer)
adminRoute.post('/addOffer',offerController.addOffer)
adminRoute.get('/editOffer',offerController.loadEditOffer)
adminRoute.post('/editOffer',offerController.editOffer)
adminRoute.post('/removeOffer',offerController.removeOffer)
adminRoute.post('/productOffer',offerController.productOffer)
adminRoute.post('/categoryOffer',offerController.categoryOffer)

// Coupen related
adminRoute.get('/allCoupen',coupenController.LoadCoupen)
adminRoute.get('/addCoupen',coupenController.loadAddCoupen)
adminRoute.post('/addCoupen',coupenController.addCoupen)
adminRoute.get('/editCoupen',coupenController.loadEditCoupen)
adminRoute.post('/editCoupen',coupenController.editCoupen)
adminRoute.post('/removeCoupon',coupenController.removeCoupon)

// sales report

adminRoute.get('/salesReport',adminController.loadSalesPage)
adminRoute.post('/salesReport',adminController.salesReport)
adminRoute.post('/salesReport',adminController.custom)

// chart report

adminRoute.put('/home/monthlyChart',adminController.monthlyChart)
adminRoute.put('/home/yearlyChart',adminController.yearlyChart)

module.exports=adminRoute


