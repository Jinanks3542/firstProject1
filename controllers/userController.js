const User = require('../model/userModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const bcrypt = require('bcrypt')
const nodeMailer = require('nodemailer')
const productModel = require('../model/productModel')
const wishlistModel = require('../model/wishlistModel')
const cartModel = require('../model/cartModel');
const Address = require('../model/addressModel')
const wallet = require('../model/walletModel')
const Order = require('../model/orderModel')


const securePassword = async (password) => {

    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }

}


const signUp = async (req, res) => {
    try {
        if (req.session.otp) {
            return res.redirect('/otp')
        }
        const msg = req.flash('msg')
        res.render('user/signUp', { msg })
    } catch (error) {
        console.log(error);
    }
}


const userInsert = async (req, res) => {
    try {

        const emailExist = await User.findOne({ email: req.body.email })
        if (emailExist) {

            req.flash('msg', 'Your Email is already exist')
            res.redirect('/signUp')
        }
        const spassword = await securePassword(req.body.password);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            password: spassword
        })

        req.session.userData = user
        req.session.otp = generateOTP()
        console.log(req.session.otp,'otp')
        // console.log(' sess otp  ;; ' + req.session.otp);
        // console.log(' sess usr  ;; ' + req.session.userData);

        await otpMailSending(req.session.userData, req.session.otp)

        req.session.userId = user._id
        res.redirect('/otp')

    } catch (error) {
        console.log(error.message);
    }
}


const home = async (req, res) => {
    try {
        res.render('user/home')
    } catch (error) {
        console.log(error)
    }
}

const login = async (req, res) => {
    try {
        const msg = req.flash('msg')
        res.render('user/login', { msg })
    } catch (error) {
        console.log(error);
    }
}

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;


        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            console.log(passwordMatch, 'yes here');
            if (passwordMatch) {
                if (userData.is_blocked) {
                    req.flash('msg', 'You are Blocked')
                    res.redirect('/login')
                } else {
                    req.session.userId = userData._id
                    res.redirect('/')
                }

            }
            else {
                req.flash('msg', 'Your password is wrong')
                res.redirect('/login')
            }
        } else {
            req.flash('msg', 'User not found')
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error);

    }

}

const resendOtp = async (req, res) => {
    try {
        req.session.otp = generateOTP()
        // console.log(req.session.otp);

        await otpMailSending(req.session.userData, req.session.otp)
        res.redirect('/otp')
    } catch (error) {
        console.log(error.message);
    }
}


const loadOtp = async (req, res) => {
    try {
        const msg = req.flash('msg')
        res.render('user/otp', { msg })
    } catch (error) {
        console.log(error);
    }
}

const verifyOtp = async (req, res) => {
    try {
        const userOtp = req.body.otp.join('')

        // console.log(req.session.userData);
        // console.log(req.session.userData.name);
        console.log('mobile', req.session.userData.mobile);



        if (userOtp == req.session.otp) {
            console.log('userData')
            const { name, email, password, mobile } = req.session.userData

            const user = new User({
                name: name,
                email: email,
                password: password,
                mobile: mobile
            })
            const userData = await user.save()
            delete req.session.otp
            req.session.userId = userData._id
            console.log(req.session.userId);
            res.redirect('/')

        }
        else {

            req.flash('msg', 'Invalid OTP')
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

const otpMailSending = async (userData, otp) => {
    try {
        let transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'jinanks66@gmail.com',
                pass: 'ngqh ecwq gloi hcck'
            }
        })

        const mailOptions = {
            from: 'jinanks66@gmail.com',
            to: userData.email,
            subject: 'Your OTP for registration',
            text: `your OTP is : ${otp}`

        }

        // Send Email
        const info = await transporter.sendMail(mailOptions)
        console.log(`Email sent:${info}`);


    } catch (error) {
        console.log(error.message);
    }
}



const loadUserhome = async (req, res) => {
    try {
        res.render('user/userHome')
    } catch (error) {
        console.log('error in loading logged in home');
    }
}


const shop = async (req, res) => {
    try {
        const limit = 8
        const page = parseInt(req.query.page) || 1
        const skip = (page - 1) * limit
        const categoryId = req.query.cat || null

        let filter = { is_blocked: false }
        let sortObj = {_id:-1}
        if (categoryId) {
            filter.categoryId = categoryId
        }
        if (req.query?.sort == 'lowToHigh') {
            delete sortObj._id
            sortObj.price = 1
        }else  if (req.query?.sort == 'highToLow') {
            delete sortObj._id
            sortObj.price = -1
        }
        const PrdctsCount = await productModel.countDocuments({ is_blocked: false })

        const totalPages = Math.ceil(PrdctsCount / limit)

        const productse = await Product.find(filter).skip(skip).limit(limit).sort(sortObj)

        const categories = await Category.find()

        let cat = categoryId
        res.render('user/shop', {
            Productss: productse,
            categories: categories,
            currentPage: totalPages,
            PrdctsCount: PrdctsCount,
            cat,
            page: page
        })
    } catch (error) {
        console.log(error.message);
    }
}


// const lowToHigh = async (req, res) => {
//     try {
//         const limit = 8;
//         const page = parseInt(req.query.page) || 1;
//         const skip = (page - 1) * limit;
//         const categoryId = req.query.cat || null;

//         let filter = { is_blocked: false };
//         let sortObj = {}
//         if (categoryId) {
//             filter.categoryId = categoryId;
//         }

//         const PrdctsCount = await productModel.countDocuments(filter);

//         const totalPages = Math.ceil(PrdctsCount / limit);

//         const productse = await Product.find(filter).skip(skip).limit(limit).sort({ price: 1 });

//         const categories = await Category.find({ is_blocked: false });

//         let cat = categoryId

//         res.render('/user/shop', {
//             Productss: productse,
//             categories: categories,
//             currentPage: totalPages,
//             PrdctsCount: PrdctsCount,
//             cat,
//             page: page
//         })
//     } catch (error) {
//         console.log(error.message);
//     }
// }


// category filtering

// const catFilter = async(req,res)=>{
//     try {

//         const categoryId = req.query.cat
//         console.log(categoryId,'asdfghjkl');

//     } catch (error) {
//         console.log(error.message);
//     }
// }


const singleProduct = async (req, res) => {
    try {
        const singleProduct = await productModel.findById({ _id: req.params.id })
            .populate('categoryId').populate('brand')
        // console.log(singleProduct);
        res.render('user/singleProduct', { singleProduct })
    } catch (error) {
        console.log(error.message);
    }
}

const userSignUp = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}
const loadAccount = async (req, res) => {
    try {
        const userId= req.session.userId
        const userDatas = await User.findOne({_id:userId})
        const addresses = await Address.findOne({UserId:userId})
        const walletDetail = await wallet.findOne({ userId })
        
        const userOrders = await Order.find({UserId:userId}).populate({
            path: 'products.productId',
            model: 'Product'
        }).populate('UserId').exec()

        const order = await Order.find({UserId:userId}).populate('products.productId')

        res.render('user/myAccount',{userDatas,addresses,walletDetail,userOrders,order})
    } catch (error) {
        console.log(error.message);
    }
}


const viewOrder = async (req, res) => {
    try {
        const {userId}=req.session
        const orderId = req.params.orderId;
        console.log(orderId, '.......................................orderId here');

        const singleData = await Order.findOne({'products._id':orderId},{'products.$':1,deliveryAddress:1,OrderId:1,payment:1,offer:1,paymentStatus:1})
        .populate('UserId')
        .populate('products.productId')
        .exec();

        console.log(singleData, '........................singleData here');

        
        if (!singleData.UserId) {
            console.error("UserId is not populated!");
        }

        res.render('user/singleOderDatas', { singleData });
    } catch (error) {
        console.log(error.message);
    }
};




// changePassword

const changepassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findOne({ _id: req.session.userId });

        if (user) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (isMatch) {
                const confirmPassword = await securePassword(newPassword);
                await User.findByIdAndUpdate({ _id: req.session.userId }, { $set: { password: confirmPassword } });

                return res.status(200).json({ success: true, message: 'Password successfully changed' });
            } else {
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
};



// add address

const addAddress  = async(req,res)=>{
    try {
        const {userId}=req.session
        
        const {name,phone,street,city,state,pincode,locality}=req.body
       
        await Address.findOneAndUpdate({UserId:userId},{$addToSet:{address:{name:name,street:street,city:city,state:state,pincode:pincode,locality:locality,phone:phone}}})
            
        res.redirect('/myAccount')

    } catch (error) {
        console.log(error.message);
        
    }
}


//............... edit address

    const editAddress = async(req,res)=>{
        try {
            const {editId}=req.body
            console.log(editId,'..........................id is here');
            
            const addressData = await Address.findOne({ 'address._id': editId }, { 'address.$': 1 });
            console.log(addressData,'id is hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
            if(addressData && addressData.address.length > 0){
                const address = addressData.address[0]
                res.json({
                    name:address.name,
                    phone:address.phone,
                    pincode:address.pincode,
                    street:address.street,
                    locality:address.locality,
                    state:address.state,
                    city:address.city,
                    addressId:address._id
                })
            } else{
                res.status(404).json({message:'address not found'})
            }
        } catch (error) {
            console.log(error.message);
            
        }
    }

    const saveEdit = async(req,res)=>{
        try {
            
            const {userId}=req.session

            const {name,phone,pincode,street,locality,state,city,addressId}=req.body
            
            
           const result = await Address.updateOne({UserId:userId,'address._id':addressId},{$set:{
                'address.$.name':name,
                'address.$.phone':phone,
                'address.$.pincode':pincode,
                'address.$.street':street,
                'address.$.locality':locality,
                'address.$.state':state,
                'address.$.city':city}})

            res.json({success:true})
        } catch (error) {
            console.log(error.message);
            
        }
    }



//....wishlist 

const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        // const cartItems = await cartModel.findOne({ userId: userId }).populate('products.productId');

        const wishlists = await wishlistModel.find({ userId: userId }).populate({
            path: 'products.productId'
        })

        res.render('user/wishlist', { wishlists })
    } catch (error) {
        console.log(error.message);
    }
}

const addWishlist = async (req, res) => {
    try {
        const userId = req.session.userId
        const productId = req.body.id
        // console.log(productId, 'productId');

        const wishlistExist = await wishlistModel.findOne({

            userId: req.session.userId,

            products: { $elemMatch: { productId } }
        })

        if (wishlistExist) {
            res.send({ fail: true })
            console.log('Item already in Wishlist');
        } else {
            await wishlistModel.findOneAndUpdate({ userId }, { $addToSet: { products: { productId } } }, { upsert: true })
            res.send({ success: true })
            console.log('Item added successfully');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const wishRemove = async (req,res)=>{
    
    try {
        const {userId}=req.session
        const {id}=req.body
        
        await wishlistModel.findOneAndUpdate({userId},{$pull:{products:{productId:id}}},{new:true})
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
        
    }
}




module.exports = {
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
    loadWishlist,
    addWishlist,
    // lowToHigh
    viewOrder,
    wishRemove,
    changepassword,
    addAddress,
    editAddress,
    saveEdit,

}