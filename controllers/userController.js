const User = require('../model/userModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const bcrypt = require('bcrypt')
const nodeMailer = require('nodemailer')
const productModel = require('../model/productModel')
const wishlistModel = require('../model/wishlistModel')
const cartModel = require('../model/cartModel');



const securePassword = async(password)=>{

try {
    const passwordHash = await bcrypt.hash(password,10)
    return passwordHash
} catch (error) {
    console.log(error.message);
}

}


const signUp = async(req,res)=>{
    try {
        if(req.session.otp){
            return res.redirect('/otp')
        }
        const msg = req.flash('msg')
        res.render('user/signUp',{msg})
    } catch (error) {
        console.log(error);
    }
}


const userInsert = async(req,res)=>{
    try {

        const emailExist= await User.findOne({email:req.body.email})
        if(emailExist){
            
            req.flash('msg','Your Email is already exist')
            res.redirect('/signUp') 
        }
        const spassword = await securePassword(req.body.password);

        const user = new User ({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            password:spassword
        })  
       
        req.session.userData=user
        req.session.otp=generateOTP()

        console.log(' sess otp  ;; '+req.session.otp);
        console.log(' sess usr  ;; '+req.session.userData);
        
        await otpMailSending(req.session.userData,req.session.otp)
        
        req.session.userId=user._id
        res.redirect('/otp')

    } catch (error) {
        console.log(error.message);
    }   
}

const home = async(req,res)=>{
    try {
        res.render('user/home')
    } catch (error) {
        console.log(error)
    }
}

const login = async(req,res)=>{
    try {
        const msg= req.flash('msg')
        res.render('user/login',{msg})
    } catch (error) {
        console.log(error);
    }
}

const verifyLogin = async(req,res)=>{
try {

    const email = req.body.email;
    const password = req.body.password;
    

    const userData = await User.findOne({email:email});
    
    if(userData){
        const passwordMatch = await bcrypt.compare(password,userData.password)
        console.log(passwordMatch,'yes here');
        if(passwordMatch){
            if(userData.is_blocked){
                req.flash('msg','You are Blocked')
                res.redirect('/login')
            }else{
                req.session.userId=userData._id
                res.redirect('/')
            }

        }
        else{
            req.flash('msg','Your password is wrong')
            res.redirect('/login')
        }
    }else{
        req.flash('msg','User not found')
        res.redirect('/login')
    }
    
} catch (error) {
    console.log(error);
    
}

}

// // category filtering







const resendOtp = async(req,res)=>{
    try {
        req.session.otp=generateOTP()
        console.log(req.session.otp);
        
        await otpMailSending(req.session.userData,req.session.otp)
        res.redirect('/otp')
    } catch (error) {
       console.log( error.message);
    }
}


const loadOtp = async(req,res)=>{
    try {
        const msg =req.flash('msg')
        res.render('user/otp',{msg})
    } catch (error) {
        console.log(error);
    }
}

const verifyOtp = async(req,res)=>{
    try {
        const userOtp = req.body.otp.join('')

        console.log(req.session.userData);
        console.log(req.session.userData.name);
        console.log('mobile',req.session.userData.mobile);


        
        if(userOtp==req.session.otp){
            console.log('userData')
            const{name,email,password,mobile}=req.session.userData

            const user = new User({
                name:name,
                email:email,
                password:password,
                mobile:mobile
            })
           const userData= await user.save()
           delete  req.session.otp
           req.session.userId=userData._id
           console.log(req.session.userId);
            res.redirect('/')
            
        }
        else{
           
            req.flash('msg','Invalid OTP')
            res.redirect('/otp')
        }
       

        
    } catch (error) {
        console.log(error.message);
    }
}

function generateOTP() {
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString();
}

const otpMailSending = async(userData,otp)=>{
    try {
        let transporter = nodeMailer.createTransport({
            service:'gmail',
            auth:{
                user:'jinanks66@gmail.com',
                pass:'ngqh ecwq gloi hcck'
            }
        })

        const mailOptions={
            from:'jinanks66@gmail.com',
            to:userData.email,
            subject:'Your OTP for registration',
            text:`your OTP is : ${otp}`
            
        }

         // Send Email
         const info = await transporter.sendMail(mailOptions)
         console.log(`Email sent:${info}`);   
         

    } catch (error) {
        console.log(error.message);
    }
}



const loadUserhome=async(req,res)=>{
    try {
        res.render('user/userHome')
    } catch (error) {
        console.log('error in loading logged in home');
    }
}


const shop=async(req,res)=>{
    try {

        const product = await Product.find({is_blocked:false})
        console.log('product',product);

        res.render('user/shop',{product})
    } catch (error) {
        console.log(error.message);
    }
}

const singleProduct = async(req,res)=>{
    try {
        const singleProduct = await productModel.findById({_id:req.params.id})
        .populate('categoryId').populate('brand')
        console.log(singleProduct);
        res.render('user/singleProduct',{singleProduct})
    } catch (error) {
        console.log(error.message);
    }
}

const userSignUp = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}
const loadAccount = async(req,res)=>{
    try {
        
        res.render('user/myAccount')
    } catch (error) {
        console.log(error.message);
    }
}

//....wishlist 

const loadWishlist = async (req,res)=>{
    try {
        const userId = req.session.userId;
        // const cartItems = await cartModel.findOne({ userId: userId }).populate('products.productId');

        const wishlists = await wishlistModel.find({userId:userId}).populate({
                path: 'products.productId'})
        
        res.render('user/wishlist',{wishlists})
    } catch (error) {
        console.log(error.message);
    }
}

const addWishlist = async(req,res)=>{
    try {
        const userId = req.session.userId
        const productId = req.body.id
        console.log(productId,'productId');

        const wishlistExist = await wishlistModel.findOne({

            userId:req.session.userId,

            products:{$elemMatch:{productId}}
        })

        if(wishlistExist){
            res.send({fail:true})
            console.log('Item already in Wishlist');
        }else{
            await wishlistModel.findOneAndUpdate({userId},{$addToSet:{products:{productId}}},{upsert:true})
            res.send({success:true})
            console.log('Item added successfully');
        }

    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    home,
    login,
    signUp,
    userInsert,
    verifyLogin,
    verifyOtp,
    loadOtp,
    otpMailSending,
    resendOtp,
    loadUserhome,
    shop,
    singleProduct,
    userSignUp,
    loadAccount,
    // categoryFiltering,
    loadWishlist,
    addWishlist,
    
}