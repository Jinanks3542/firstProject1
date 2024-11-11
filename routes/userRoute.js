const express = require('express')
const router = express()
const userControllers=require('../controllers/userController')
const session = require('express-session');
const auth=require('../middleware/userMiddleware')
const googleLogin=require('../passport')
const cartController= require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const walletController = require('../controllers/walletController')
const nocache = require('nocache')


router.use(session({secret:"a1a1a1a1",resave:false,saveUninitialized:true}))
router.use(nocache())
// user Login
router.get('/',userControllers.home)
router.get('/login',auth.myAccountauthorize,userControllers.login)
router.post('/login',userControllers.verifyLogin)
router.get('/userHome',auth.isblocked,userControllers.loadUserhome)
router.get('/myAccount',auth.noUserLogin,auth.isblocked,userControllers.loadAccount)
router.post('/userProfile',userControllers.editProfile)


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
router.post('/countCart',userControllers.countCart)
router.post('/countWishlist',userControllers.countWishlist)



// google authentication
router.get('/auth/google', googleLogin.googleAuth);
router.get("/auth/google/callback",googleLogin.googleCallback, googleLogin.setupSession);


// cart related
router.get('/cart',auth.noUserLogin,auth.isblocked,cartController.loadCart)
router.patch('/addCart',auth.noUserLogin,cartController.addCart)
router.patch('/cart',auth.isblocked,cartController.priceUpdate)
router.post('/remove',auth.isblocked,cartController.remove)


// checkout related
router.get('/checkout',auth.isblocked,cartController.loadCheckout)
router.post('/address',auth.isblocked,cartController.checkoutDetails)
router.patch('/removeAddress',auth.isblocked,cartController.removeAddress)
router.patch('/radioAddress',auth.isblocked,cartController.chooseAddress)
router.post('/razor',auth.isblocked,orderController.razor)
router.post('/edittAddress',cartController.editAddress)
router.patch('/saveChanges',cartController.saveEditData)


// order related
router.get('/order',auth.isblocked,orderController.loadOrder)
router.post('/order',auth.isblocked,orderController.placeOrder)
router.get('/invoice/:id',auth.isblocked,orderController.invoice)
router.post('/cancelOrder',auth.isblocked,orderController.cancelOrder)
router.post('/returnRequest',auth.isblocked,orderController.returnRequest)
router.post('/rePayment',orderController.rePayment)

//  wishlist
router.get('/wishlist',auth.noUserLogin,auth.isblocked,userControllers.loadWishlist)
router.patch('/addWishlist',auth.isblocked,userControllers.addWishlist)
router.post('/wishRemove',auth.isblocked,userControllers.wishRemove)

// wallet
router.post('/razors',auth.isblocked,walletController.razorPay)
router.post('/addWallet',auth.isblocked,walletController.walletAdd)
router.post('/walletFail',walletController.walletFail)

router.post('/changePassword',auth.isblocked,userControllers.changepassword)
router.get('/singleOderDatas/:orderId',auth.isblocked,userControllers.viewOrder)
router.post('/couponApply',auth.isblocked,cartController.couponApply)
router.patch('/removeCoupon',cartController.removeCoupon)
router.post('/addAddress',auth.isblocked,userControllers.addAddress)
router.post ('/editAddress',auth.isblocked,userControllers.editAddress)
router.patch('/saveEdit',auth.isblocked,userControllers.saveEdit)
router.patch('/removePfAddress',userControllers.removePfAddress)

module.exports=router









