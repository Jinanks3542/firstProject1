const express = require('express')
const router = express()
const userControllers=require('../controllers/userController')
const session = require('express-session');
const auth=require('../middleware/userMiddleware')
const googleLogin=require('../passport')
const cartController= require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const walletController = require('../controllers/walletController')



// user Login
router.get('/',userControllers.home)
router.get('/login',auth.myAccountauthorize,userControllers.login)
router.post('/login',userControllers.verifyLogin)
router.get('/userHome',auth.isblocked,userControllers.loadUserhome)
router.get('/myAccount',userControllers.loadAccount)
// router.post('/userProfile',userControllers,loadAccount)

// user signUp
router.get('/logout',userControllers.userSignUp)
router.get('/signUp',userControllers.signUp)
router.post('/signUp',userControllers.userInsert)

// otp related
router.get('/otp',userControllers.loadOtp)
router.post('/otp',userControllers.verifyOtp)
router.get('/resendOtp',userControllers.resendOtp)


// shop related
router.get('/shop',userControllers.shop)
router.get('/singleProduct/:id',userControllers.singleProduct)


// google authentication
router.get('/auth/google', googleLogin.googleAuth);
router.get("/auth/google/callback", googleLogin.googleCallback, googleLogin.setupSession);


// cart related
router.get('/cart',cartController.loadCart)
router.patch('/addCart',cartController.addCart)
router.patch('/cart',cartController.priceUpdate)
router.post('/remove',cartController.remove)


// checkout related
router.get('/checkout',cartController.loadCheckout)
router.post('/address',cartController.checkoutDetails)
router.patch('/removeAddress',cartController.removeAddress)
router.patch('/radioAddress',cartController.chooseAddress)
router.post('/razor',orderController.razor)


// order related
router.get('/order',orderController.loadOrder)
router.post('/order',orderController.placeOrder)

//  wishlist
router.get('/wishlist',userControllers.loadWishlist)
router.patch('/addWishlist',userControllers.addWishlist)
router.post('/wishRemove',userControllers.wishRemove)

// wallet
router.post('/razors',walletController.razorPay)
router.post('/addWallet',walletController.walletAdd)

router.post('/changePassword',userControllers.changepassword)
router.get('/singleOderDatas/:orderId',userControllers.viewOrder)
router.post('/couponApply',cartController.couponApply)
router.post('/addAddress',userControllers.addAddress)
router.post ('/editAddress',userControllers.editAddress)
router.patch('/saveEdit',userControllers.saveEdit)

module.exports=router

