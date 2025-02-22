const wallet = require('../model/walletModel')
const User = require('../model/userModel')
const instance = require('../config/razorpay')
require('dotenv').config();




const razorPay = async (req, res) => {
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
                //console.log('shkjfdhsfhlasdfhas;dkfhsdfjhasfkjhskjfhksjdfhksdfkjsfjk')
                console.error("Error creating order:", err);
                res.status(500).send({ success: false, msg: "Failed to add amount" });
            }
        });
    } catch (error) {
        console.log('Caught an error:', error.message);
        res.status(500).send({ success: false, msg: error.message });
    }
};


const walletAdd = async (req,res)=>{
    try {
        const addMoney =req.body.walletAdd
        await wallet.findOneAndUpdate({userId:req.session.userId},{$inc:{balance:addMoney},$push:{transaction:{amount:addMoney,creditOrDebit:'credit', date: new Date()}}},{upsert:true, new:true})
        res.redirect('/myAccount')
    } catch (error) {
        error.message(error.message)
    }
}

const walletFail = async (req,res)=>{
    try {
        const {userId} = req.session
        const amount = req.body.amount

        const findFailedData = await wallet.findOne({userId,'transaction.amount':amount,'transaction.creditOrDebit':'failed'})
        // console.log(findFailedData,':::::::::::::::');
        if(!findFailedData){
        await wallet.findOneAndUpdate({userId},{$push:{transaction:{amount:amount,creditOrDebit:'failed',date:new Date()}}},{upsert:true,new:true})
        return res.send({success:true, msg:'Failed Transaction Recorded'})
        }else{
            res.send({ success: false, msg: 'Transaction already recorded as failed' });
        }
    } catch (error) {
        console.log(error.message);
        
    }
}

module.exports = {
    razorPay,
    walletAdd,
    walletFail
}


 