const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Cart = require('../model/cartModel')
const Address = require('../model/addressModel')
const Product = require('../model/productModel');
const instance = require('../config/razorpay')
const Coupon = require('../model/coupenModel')
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
        const {selectAddress} = req.body
        let pay=''
                
                if(req.body.pp==="Online Payment"){
                    pay="Paid"
                }else if(req.body.pp==="Cash on Delivery"){
                    pay="Pending"
                }

        const {userId}=req.session
        const cartDatas = await Cart.findOne({userId:userId}).populate("products.productId")
        const choosedData = await Address.findOne({UserId:userId,'address.status':true},{'address.$':1})
        const {name,street,city,state,pincode,locality,phone}=choosedData?.address?.[0]??{};
        
        let quantityTotal=0
        let totalSum=0
        if(!req.session.Coupon){
        cartDatas.products.forEach((element)=> {
            quantityTotal=element.productId.price*element.quantity
            totalSum+=quantityTotal
            
        });
        
    }else{
        totalSum = req.session.totalOrderAmount
        
         await User.findOneAndUpdate({_id:req.session.userId,'coupons.code':req.session.code},{$set:{'coupons.$.couponStatus':'Claimed'}})
       
        
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
        })
       const save= await orderDataSave.save()
        
        
       if(save){
        for(const value of productss){
            let product = await Product.findOne({_id:value.productId})
            let qty = product.quantity - value.quantity
            await Product.findOneAndUpdate({_id:value.productId},{$set:{quantity:qty}})
            
            
        }
        await Cart.findOneAndDelete({userId:userId})
    
        
       }

       res.redirect('/order') 
       
       
    } catch (error) {
        console.log(error.message);
    }
}

//  order side



const loadOrderList= async(req,res)=>{
    try {
        
        const orderDatas = await Order.find().populate('products.productId  UserId').exec()
    
        console.log(orderDatas);
        res.render('admin/orderList',{orderDatas})
    } catch (error) {
        console.log(error.message);
    }
}

const viewDetail = async(req,res)=>{
    try {
        const OrderId=req.params.id
        const singleData = await Order.findOne({_id:OrderId}).populate('products.productId  UserId').exec()
        

        res.render('admin/singleOrder',{singleData})
    } catch (error) {
        console.log(error.message);
    }
}


// const razor = async (req,res)=>{
//     try {
        
//         const user = await User.findOne({_id:req.body.userId})
//         const amount = req.body.amount * 100
//         const options = {
//             amount,
//             currency: "INR",
//             receipt: 'absharameen625@gmail.com'
//         }
//         console.log('kjkjkjhkjkjkjkhk');
//         instance.orders.create(options, (err, order)=>{
            
//             if(!err){
//                 res.send({
//                     succes: true,
//                     msg: 'ORDER created',
//                     order_id: order.id,
//                     amount,
//                     key_id: process.env.RAZORPAY_IDKEY,
//                     name: user.name,
//                     email: user.email
//                 })
                
//             }else{
//                 console.error("Error creating order:", err);
//                 res.status(500).send({ success: false, msg: "Failed to create order" });
//             }
//         })
//     } catch (error) {
//         console.log(error.message);
//     }
// }

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


module.exports={
    loadOrder,
    placeOrder,
    loadOrderList,
    viewDetail,
    razor,
    
}