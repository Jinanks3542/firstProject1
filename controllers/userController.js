const User = require("../model/userModel");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
const productModel = require("../model/productModel");
const wishlistModel = require("../model/wishlistModel");
const cartModel = require("../model/cartModel");
const Address = require("../model/addressModel");
const wallet = require("../model/walletModel");
const Order = require("../model/orderModel");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const generatecode = async() => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
 const getUser= await User.findOne({refferalId:code});
 if(!getUser) return code;
 else return generatecode()
};




const signUp = async (req, res) => {
  try {
    if (req.session.otp) {
      return res.redirect("/otp");
    }
    const msg = req.flash("msg");
    res.render("user/signUp", { msg });
  } catch (error) {
    console.log(error);
  }
};



const userInsert = async (req, res) => {
  try {

    //console.log("Signup process started");

    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      req.flash("msg", "Your Email is already exist");
      return res.redirect("/signUp");
    }
    
    const spassword = await securePassword(req.body.password);
    if (req.body.code){
      req.session.ref = req.body.code;
    } 
    const code=await generatecode()
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      password: spassword,
      refferalId:code,
      refferalCodeSave:req.body.code
    });

    req.session.userData = user;
    req.session.otp = generateOTP();
    req.session.otpExpiresAt = Date.now()+60*1000
    console.log("Generated OTP:", req.session.otp);

    await otpMailSending(req.session.userData, req.session.otp);

    req.session.userId = user._id;

    return res.redirect("/otp");
  } catch (error) {
    console.log("Error during user signup:", error.message);
    req.flash("msg", "Error processing your signup. Please try again.");
    return res.redirect("/signUp");
  }
};




const home = async (req, res) => {
  try {
    const bestSellingProducts = await Order.aggregate([{$match:{'products.ProductStatus':'Delivered'}},{$unwind:'$products'},{$group:{_id:'$products.productId',totalSold:{$sum:'$products.quantity'},soldCount:{$sum:1}}},{$sort:{totalSold:-1}},{$limit:4},{$lookup: {
      from: "products", 
      localField: "_id", 
      foreignField: "_id", 
      as: "productDetails" 
    }},
    {$unwind:'$productDetails'},
    {$project: {
      productName: "$productDetails.productName", 
      totalSold:1,
      soldCount:1,
      price: "$productDetails.price",
      images: "$productDetails.images",
      offerPercentage:'$productDetails.offer',
      offerPrice:'$productDetails.offerPrice'
    }}
  ])


const newArrivals = await productModel.find()
.sort({ _id: -1 }) 
.limit(5);

const categories = await Category.find({})
    res.render("user/home",{bestSellingProducts,newArrivals,categories});
  } catch (error) {
    console.log(error);
  }
};



const login = async (req, res) => {
  try {
    const msg = req.flash("msg");
    res.render("user/login", { msg });
  } catch (error) {
    console.log(error);
  }
};



const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      //console.log(passwordMatch, "yes here");
      if (passwordMatch) {
        if (userData.is_blocked) {
          req.flash("msg", "You are Blocked");
          res.redirect("/login");
        } else {
          req.session.userId = userData._id;
          res.redirect("/");
        }
      } else {
        req.flash("msg", "Your password is wrong");
        res.redirect("/login");
      }
    } else {
      req.flash("msg", "User not found");
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
};



const loadOtp = async (req, res) => {
  try {
    console.log(req.session.otp, "otp");
    if (!req.session.otp) return res.redirect("/signUp");
    const msg = req.flash("msg");
    res.render("user/otp", { msg });
  } catch (error) {
    console.log(error);
  }
};


const verifyOtp = async (req, res) => {
  try {
    const userOtp = req.body.getOtp
    console.log(userOtp,':user otp is here');
    
  
    //console.log("mobile", req.session.userData.mobile);

    const { name, email, password, mobile,ref,refferalId,refferalCodeSave } = req.session.userData;
    if(Date.now()>req.session.otpExpiresAt){
      req.flash('msg','Your otp has expired')
    }


    

    if (userOtp === req.session.otp) {
      console.log(req.session.otp,':req.session.otp');
      let refrealUser =null
      if (refferalCodeSave) {
        //console.log(refferalCodeSave,':referal id is here');
        
        refrealUser = await User.findOne({refferalId: refferalCodeSave });
        //console.log(refrealUser,':used user is here');
        
        
        if(refrealUser){
             await wallet.findOneAndUpdate({userId:refrealUser._id},{$inc:{balance:100},$push:{transaction:{amount:100,creditOrDebit:'credit'}}},{upsert:true,new:true})
             
        }
      }
      const user = new User({
        name: name,
        email: email,
        password: password,
        mobile: mobile,
        refferalId:refferalId,
        refferalCodeSave:refferalCodeSave
      });
      const userData = await user.save();

      
      if(userData.refferalCodeSave&&refrealUser){
        
           await wallet.findOneAndUpdate({userId:user._id},{$inc:{balance:100},$push:{transaction:{amount:100,creditOrDebit:'credit'}}},{upsert:true,new:true})
      }
        delete req.session.otp;

        req.session.userId = userData._id;
         res.json({success:true, message:'OTP verified successfully'})
      
      
     }else{
       
      return res.json({success:false, message:'Invalid OTP'})
     
    }  
   
  } catch (error) {
    console.log(error.message);
  }
};


function generateOTP() {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
}


const otpMailSending = async (userData, otp) => {
  try {
    let transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: "jinanks66@gmail.com",
        pass: "ngqh ecwq gloi hcck",
      },
    });

    const mailOptions = {
      from: "jinanks66@gmail.com",
      to: userData.email,
      subject: "Your OTP for registration",
      text: `your OTP is : ${otp}`,
    };

    // Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent:${info}`);
  } catch (error) {
    console.log(error.message);
  }
};


const resendOtp = async (req, res) => {
  try {
    req.session.otp = generateOTP();
    req.session.otpExpiresAt = Date.now()+60*1000

    console.log(req.session.otp);

    await otpMailSending(req.session.userData, req.session.otp);
    res.redirect("/otp");
  } catch (error) {
    console.log(error.message);
  }
};



const loadUserhome = async (req, res) => {
  try {
    res.render("user/userHome");
  } catch (error) {
    console.log("error in loading logged in home");
  }
};



const shop = async (req, res) => {
  try {
    const limit = 8;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const productCount = await Product.countDocuments({ is_blocked: false });
    const totalPages = Math.ceil(productCount / limit);
    const categoryId = req.query.cat || null;

    let filter = { is_blocked: false,is_categoryBlocked:false} ;
    // let blockCat = {is_categoryBlocked:false}
    // console.log(filter,'gfhghghfgfghghgh');
    
    let sortObj = { _id: -1 };
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    if (req.query?.sort == "lowToHigh") {
      delete sortObj._id;
      sortObj.offerPrice = 1;
    } else if (req.query?.sort == "highToLow") {
      delete sortObj._id;
      sortObj.offerPrice = -1;
    }
    // const PrdctsCount = await productModel.countDocuments({ is_blocked: false })

    // const totalPages = Math.ceil(PrdctsCount / limit)

    let productse = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortObj);

      // console.log(productse,'productse arae hereeee');
      

    const categories = await Category.find();

    let cat = categoryId;

    const searchQuery = req.query.search;
    if (searchQuery) {
      productse = await Product.find({
        $or: [
          { productName: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
        ],
        is_blocked: false,
        is_categoryBlocked: false,
      });
    }

    res.render("user/shop", {
      Productss: productse,
      categories: categories,
      totalPages,
      PrdctsCount: productCount,
      cat,
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// 

const countCart = async(req,res)=>{
  try {
    const userId = req.session.userId
    
      const userCart = await cartModel.findOne({userId})
      const itemLength = userCart? userCart.products.length: 0
      
      res.json({count:itemLength})
    
  } catch (error) {
    console.log(error.message);
    
  }
}



const countWishlist = async(req,res)=>{
  try {
    const userId = req.session.userId
    const userWishlist = await wishlistModel.findOne({userId})
    //console.log(userWishlist,':userWishlist');
    
    const itemLength = userWishlist?userWishlist.products.length:0
    res.json({Count:itemLength})
  } catch (error) {
    console.log(error.message);
    
  }
}


const singleProduct = async (req, res) => {
  try {
    const singleProduct = await productModel
      .findById({ _id: req.params.id })
      .populate("categoryId")
      .populate("brand");
    // console.log(singleProduct);
    res.render("user/singleProduct", { singleProduct });
  } catch (error) {
    console.log(error.message);
  }
};



const userSignUp = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};


const loadAccount = async (req, res) => {
  try {
    const userId = req.session.userId;
    const userDatas = await User.findOne({ _id: userId });
    const walletDetail = await wallet.findOne({ userId });


    // for getting pagination in order page

    const limit = 2
    const page = parseInt(req.query.page)||1
    const skip = (page-1)*limit
    const orderCount = await Order.countDocuments({UserId:userId})

    const totalPages = Math.ceil(orderCount/limit)

    const userOrders = await Order.find({ UserId: userId })
      .populate({
        path: "products.productId",
        model: "Product",
      })
      .populate("UserId")
      .sort({ _id: -1 })
      .exec();

    const order = await Order.find({ UserId: userId })
      .populate("products.productId").skip(skip).limit(limit)
      .sort({ _id: -1 }).exec();

      // order.forEach((order)=>{
      //   console.log('---------- orders ----------',order.products)

      // })

      // userOrders.forEach((userOrders)=>{
      //   console.log('---------- userOrders ----------',userOrders.products)

      // })
      

      
    // pagination for wallet
    const limitt = 3
    const pages = parseInt(req.query.page)||1
    const skipp = (pages-1)*limitt
    const addressCountt = await Address.countDocuments({UserId:userId})
    const totalPagess = Math.ceil(addressCountt/limitt)
    const addresses = await Address.findOne({ UserId: userId }).skip(skipp).limit(limitt).sort({_id:-1}).exec()


    res.render("user/myAccount", {
      userDatas,
      addresses,
      walletDetail,
      userOrders,
      order,
      currentPage:page,
      totalPages,
      pages,
      totalPagess
    });
  } catch (error) {
    console.log(error.message);
  }
};

// .................profile edit


const editProfile = async (req,res)=>{
  try {
    const {name,phone}=req.body
    const userId = req.session.userId;
    const editUser = await User.findByIdAndUpdate(userId,{name:name,mobile:phone})
    res.redirect('/myAccount')
    //console.log(editUser,'bbbbbbbbbbbbbbbbbb');

  } catch (error) {
    console.log(error.message);
    
  }
}


const viewOrder = async (req, res) => {
  try {
    const { userId } = req.session;
    const orderId = req.params.orderId;
    const fullData = await Order.findOne(
      { "products._id": orderId }
    )
      .populate("UserId")
      .populate("products.productId")
      .exec();

    const singleData = await Order.findOne(
      { "products._id": orderId },
      {
        "products.$": 1,
        deliveryAddress: 1,
        OrderId: 1,
        payment: 1,
        offer: 1,
        paymentStatus: 1,
      }
    )
      .populate("UserId")
      .populate("products.productId")
      .exec();

    if (!singleData.UserId) {
      console.error("UserId is not populated!");
    }

    res.render("user/singleOderDatas", { singleData,fullData });
  } catch (error) {
    console.log(error.message);
  }
};

//......... changePassword


const changepassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ _id: req.session.userId });

    if (user) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (isMatch) {
        const confirmPassword = await securePassword(newPassword);
        await User.findByIdAndUpdate(
          { _id: req.session.userId },
          { $set: { password: confirmPassword } }
        );

        return res
          .status(200)
          .json({ success: true, message: "Password successfully changed" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred. Please try again later.",
      });
  }
};

//......... add address


const addAddress = async (req, res) => {
  try {
    const { userId } = req.session;    
    console.log('ounj');
    

    const { name, phone, street, city, state, pincode, locality } = req.body;

    const addresss = await Address.findOneAndUpdate(
      { UserId: userId },
      {
        $addToSet: {
          address: {
            name: name,
            street: street,
            city: city,
            state: state,
            pincode: pincode,
            locality: locality,
            phone: phone,
          },
        },
      },{
        upsert : true,
        new : true
      }
    );
    // console.log('kolkjjn', addresss);
    

    res.redirect("/myAccount");
  } catch (error) {
    console.log(error.message);
  }
};

//............... edit address

const editAddress = async (req, res) => {
  try {
    const { editId } = req.body;

    const addressData = await Address.findOne(
      { "address._id": editId },
      { "address.$": 1 }
    );

    if (addressData && addressData.address.length > 0) {
      const address = addressData.address[0];
      res.json({
        name: address.name,
        phone: address.phone,
        pincode: address.pincode,
        street: address.street,
        locality: address.locality,
        state: address.state,
        city: address.city,
        addressId: address._id,
      });
    } else {
      res.status(404).json({ message: "address not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const saveEdit = async (req, res) => {
  try {
    const { userId } = req.session;

    const { name, phone, pincode, street, locality, state, city, addressId } =
      req.body;

    const result = await Address.updateOne(
      { UserId: userId, "address._id": addressId },
      {
        $set: {
          "address.$.name": name,
          "address.$.phone": phone,
          "address.$.pincode": pincode,
          "address.$.street": street,
          "address.$.locality": locality,
          "address.$.state": state,
          "address.$.city": city,
        },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};


const removePfAddress = async (req,res)=>{
  try {
    const removeId = req.body.ID
    const {userId} = req.session
    //console.log(removeId,':removeId is hereeeeeeeeee');
    const deletedData = await Address.findOneAndUpdate({UserId:userId},{$pull:{address:{_id:removeId}}},{new:true})
    if(deletedData){
      res.json({success:true})
    }
    
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
      path: "products.productId",
    });

    res.render("user/wishlist", { wishlists });
  } catch (error) {
    console.log(error.message);
  }
};

const addWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.body.id;
    // console.log(productId, 'productId');

    const wishlistExist = await wishlistModel.findOne({
      userId: req.session.userId,

      products: { $elemMatch: { productId } },
    });

    if (wishlistExist) {
      res.send({ fail: true });
      console.log("Item already in Wishlist");
    } else {
      await wishlistModel.findOneAndUpdate(
        { userId },
        { $addToSet: { products: { productId } } },
        { upsert: true }
      );
      res.send({ success: true });
      //console.log("Item added successfully");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const wishRemove = async (req, res) => {
  try {
    const { userId } = req.session;
    const { id } = req.body;

    await wishlistModel.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId: id } } },
      { new: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

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
  countCart,
  countWishlist,
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
  removePfAddress,
  editProfile,
};
