const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Cart = require('../model/cartModel')
const Address = require('../model/addressModel')
const Product = require('../model/productModel');
const instance = require('../config/razorpay')
const Coupon = require('../model/coupenModel')
const Wallet = require('../model/walletModel')
const mongoose = require('mongoose');

require('dotenv').config();





const loadOrder=async(req,res)=>{
    try {
        res.render('user/order')
    } catch (error) {
        console.log(error.message);
    }
}

const placeOrder = async(req,res)=>{
    try {
        const {selectAddress,paymentStatus} = req.body
        
        let pay=''
                
        if (req.body.pp === "Online Payment") {
            if (req.body.paymentStatus === "pending") {
                pay = "Pending"; 
            } else if (req.body.paymentStatus === "paid") {
                pay = "Paid"; 
            }
        } else if (req.body.pp === "Cash on Delivery") {
            pay = "Pending";  
        }
        const {userId}=req.session
        
        const cartDatas = await Cart.findOne({userId:userId}).populate("products.productId")
        console.log(cartDatas,'cart datas here');
        
        
        const choosedData = await Address.findOne({UserId:userId,'address.status':true},{'address.$':1})
        const {name,street,city,state,pincode,locality,phone}=choosedData?.address?.[0]??{};
        
        let quantityTotal=0
        let totalSum=0
        
        if(!req.session.Coupon){
            cartDatas.products.forEach((element)=> {
                quantityTotal=element.productId.offerPrice*element.quantity
                totalSum+=quantityTotal        
            });
        }else{
            totalSum = req.session.totalOrderAmount
            
            await User.findOneAndUpdate({_id:req.session.userId,'coupons.code':req.session.code},{$set:{'coupons.$.couponStatus':'Claimed'}})
            req.session.totalOrderAmount=undefined 
        }

        const productData=cartDatas.products
        
        const passCouponToUser = await Coupon.find({
            buyLow:{$lte:totalSum},
            buyHigh:{$gte:totalSum}

        })
        
        let result = true
        let value

        for(let offer of passCouponToUser){
            result = await User.findOne({_id:req.session.userId,
                coupons:{
                    $elemMatch:{
                        code:offer.code
                    }
                }
            })
            if(!result){
                value=offer;
                
                break;
        }

        }

        if(value){
            const date = new Date()
            const expiryDate = new Date(date) 
            expiryDate.setDate(date.getDate()+ 10)
            const user = await User.findOneAndUpdate({_id:req.session.userId},{$addToSet:{coupons:{couponId:value._id,code:value.code,expiryDate:expiryDate}}})
            
        }
        
        const productss = cartDatas.products.map(product=>({
            productId:product.productId._id,
            productPrice:product.productId.offerPrice,
            quantity:product.quantity

        })) 
 
        
        const orderDataSave=new Order({
            UserId:userId,
            products:productss,
            
            deliveryAddress:{
                name,
                street,
                city,
                state,
                pincode,
                locality,
                phone
            },
            payment:req.body.pp,
            orderAmount:totalSum,
            orderDate:Date(),
            paymentStatus:pay,
            offer:req.session.Coupon

        })
       const save= await orderDataSave.save()
        console.log(save.offer,':coupon percentage');
        
        
       if(save){
        for(const value of productss){
            let product = await Product.findOne({_id:value.productId})
            let qty = product.stock - value.quantity
            await Product.findOneAndUpdate({_id:value.productId},{$set:{stock:qty}})
            
        }
        await Cart.findOneAndDelete({userId:userId})
    
       }
       
       if(save.payment=='Online Payment'&&save.paymentStatus=='Pending'){
           res.redirect('/myAccount')
        }
        else{
        res.redirect('/order') 
       }
       
    } catch (error) {
        console.log(error.message);
    }
}

//  order side



const loadOrderList = async (req, res) => {
    try {
        const limit = 4; 
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit; 

        const totalCount = await Order.countDocuments(); 
        const totalPages = Math.ceil(totalCount / limit);

        
        const orderDatas = await Order.find()
            .populate('products.productId UserId') 
            .sort({ _id: -1 }) 
            .skip(skip) 
            .limit(limit) 
            .exec();

        
        res.render('admin/orderList', {
            orderDatas, 
            totalPages, 
            currentPage: page 
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
};



const viewDetail = async(req,res)=>{
    try {
        const OrderId=req.params.id
        const singleData = await Order.findOne({_id:OrderId}).populate('products.productId  UserId').exec()
        

        res.render('admin/singleOrder',{singleData})
    } catch (error) {
        console.log(error.message);
    }
}

const updateStatus = async (req, res) => {
    try {
        const { orderId, productId, status } = req.body;
        await Order.findOneAndUpdate(
            { _id: orderId, 'products.productId': productId },
            { $set: { 'products.$.ProductStatus': status } },
            { new: true }
        );
        res.redirect(`/admin/singleOrder/${orderId}`);
    } catch (error) {
        console.log('Error updating product status:', error.message);
    }
};





const razor = async (req, res) => {
    try {
        
        const user = await User.findOne({ _id: req.session.userId });
        const amount = req.body.amount * 100;
        const options = {
            amount,
            currency: "INR",
            receipt: 'absharameen625@gmail.com'
        };
        console.log('Creating order with options:', options,user);

        instance.orders.create(options, (err, order) => {
            if (!err) {
                res.send({
                    success: true,
                    msg: 'ORDER created',
                    order_id: order.id,
                    amount,
                    key_id: process.env.RAZORPAY_IDKEY,
                    name: user.name,
                    email: user.email
                });
            } else {
                console.error("Error creating order:", err);
                res.status(500).send({ success: false, msg: "Failed to create order" });
            }
        });
    } catch (error) {
        console.log('Caught an error:', error.message);
        res.status(500).send({ success: false, msg: error.message });
    }
};

const invoice = async (req,res)=>{
    try {
        const invoiceId= req.params.id
        
        const forInvoice = await Order.findById(invoiceId).populate('products.productId').exec()  

        res.render('user/invoice',{forInvoice})

    } catch (error) {
        console.log(error.message);
        
    }
}

const cancelOrder = async (req, res) => {
    try {
      const { orderId, productId, cancelReason } = req.body;
      const userid = req.session.userId;
      const percentage = req.session.Coupon
      
  
      const cancel = await Order.findOneAndUpdate(
        { _id: orderId, 'products._id': productId, UserId: userid },
        { $set: { 'products.$.ProductStatus': 'Canceled' } },
        { new: true } 
      );

  
      if (cancel) {
        const check = await Order.findOne(
          { UserId: userid, 'products._id': productId },
          { 'products.$': 1 }
        ).populate('products.productId');

        
        let productTotal = 0;
        let creditAmount = 0
        productTotal = check.products[0].productPrice * check.products[0].quantity;
        console.log(productTotal,':productTotal');
        
        creditAmount = Math.round(productTotal-(cancel.offer/100)*productTotal)
        
        const orderData = await Order.findOne({ _id: orderId });
  
        if (check.products[0].ProductStatus === 'Canceled' && orderData.payment === 'Online Payment') {
          await Wallet.findOneAndUpdate(
            { userId: userid },
            {
              $inc: { balance: creditAmount },
              $push: { transaction: { amount: creditAmount, creditOrDebit: 'credit' } }
            },
            { upsert: true, new: true }
          );
        }
  
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Order not found or unable to cancel' });
      }
    } catch (error) {
      console.error('Error in cancelling order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
  
const returnRequest = async(req,res)=>{
    try {
        const {orderId,productId,returnReason}=req.body
        const userId = req.session.userId
        await Order.findOneAndUpdate({_id:orderId,'products._id':productId,UserId:userId},{$set:{'products.$.ProductStatus':'Return Requested','products.$.returnReason':returnReason}},{new:true})
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
        
    }
}

const returnApprove = async(req,res)=>{
    try {
        const {orderId,productId,returnReason}=req.body
        
        const {userId}=req.session
        const returnedOrder = await Order.findOneAndUpdate({UserId:userId,_id:orderId,'products._id':productId},{$set:{'products.$.ProductStatus':'Return','products.$.returnReason':returnReason}},{'products.$':1},{new:true})
        if(returnedOrder){
            const check = await Order.findOne(
                { UserId: userId, 'products._id': productId },
                { 'products.$': 1 }
              ).populate('products.productId'); 
              
            //   for getting coupon percentage
              let couponPercentage =0
              check.products.forEach((product)=>{
                couponPercentage = product.productId.offer
                
              })
              
              
              let productTotal = 0;
              let amountCredited = 0;
              productTotal = check.products[0].productPrice * check.products[0].quantity;
              amountCredited =Math.round( productTotal - (couponPercentage/100)*productTotal)

              const orderData = await Order.findOne({ _id: orderId });

              if (check.products[0].ProductStatus === 'Return'){
                
                    await Wallet.findOneAndUpdate(
                      { userId: userId },
                      {
                        $inc: { balance: amountCredited },
                        $push: { transaction: { amount: amountCredited, creditOrDebit: 'credit' } }
                      },
                      { upsert: true, new: true }
                    );
                  
              }

              res.json({ success: true });
              
        }else{
            res.json({ success: false, message: 'Order not found or unable to return' });
          }
         
        

    } catch (error) {
        console.log(error.message);
        
    }
}

const rePayment = async(req,res)=>{

    try {
        const {orderId,productId,amount}=req.body
        const orderData = await Order.findOne({_id:orderId})
        await Order.findOneAndUpdate({_id:orderId},{$set:{paymentStatus:'paid',orderAmount:amount}})
        return res.json({success:true,message:'order sucessfully placed'})        
    } catch (error) {
        console.log(error.message);
        
    }
    
    
}

module.exports={
    loadOrder,
    placeOrder,
    loadOrderList,
    viewDetail,
    razor,
    updateStatus,
    invoice,
    cancelOrder,
    returnRequest,
    returnApprove,
    rePayment,
    
}