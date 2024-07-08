    const User = require('../model/userModel')
    const Cart = require('../model/cartModel');
    const Product = require('../model/productModel');
    const Address = require('../model/addressModel')


    // const loadCart = async(req,res)=>{
    //     try {
    //         const userId = req.session.userId
    //         console.log('userId',userId);
    //         const cart=await Cart.find({userId:userId})
    //         console.log('cart',cart);
    //         res.render('user/cart',{cart:cart})
    //     } catch (error) {
    //         console.log(error.message);
    //     }
    // }
    const loadCart = async(req, res) => {
        try {
            const userId = req.session.userId;
    
            const cart = await Cart.findOne({ userId: userId }).populate('products.productId');
            
            res.render('user/cart', { cart: cart });
        } catch (error) {
            console.log(error.message);
        }
    }


    const addCart = async(req,res)=>{
        try {
            
            const productId = req.body.id
            const userId = req.session.userId

            const cartExist = await Cart.findOne({
                userId:req.session.userId,
                products:{$elemMatch:{productId}}
            })
            if(cartExist){
                res.send({fail:true})
            }else{

            await Cart.findOneAndUpdate(
                {userId},
                {$addToSet:{
                    products:{
                        productId,
                        quantity:1
                    }
                }},
                {upsert:true}
                
        )
        res.send({success:true})
    }
    
        } catch (error) {
            console.log(error.message);
        }
    }

    const priceUpdate = async(req,res)=>{
        try {
            const {prodId,element}=req.body
            const updateCart = await Cart.findOneAndUpdate({userId:req.session.userId,'products.productId':prodId},{$set:{'products.$.quantity':element}},{new:true})
        } catch (error) {
            console.log(error.message);
        }
    }


    const remove =async(req,res)=>{
        try {
            const {productId}=req.body
            await Cart.findOneAndUpdate({userId:req.session.userId},{$pull:{products:{productId:productId}}},{new:true})
        } catch (error) {
            console.log(error.message)
        }
    }


    // for checkout

    const loadCheckout = async(req,res)=>{
        try {
            const {userId}=req.session 
            
            const cartDetail = await Cart.findOne({userId:userId}).populate({
                path: 'products.productId',
                populate: {
                  path: 'brand',
                  model: 'Brand'
                }
              });
              const addressDocuments=await Address.find({UserId:userId}).sort({_id:-1}).limit(3)
           
            const addresses = addressDocuments.length > 0 ? addressDocuments[0].address.slice(-3).reverse() : [];            
            console.log(cartDetail,'cart detail')
            res.render('user/checkout',{cartDetail,addresses})

        } catch (error) {
           console.log(error.message); 
        }
    }

    const checkoutDetails = async(req,res)=>{
        try {
            const {userId}=req.session || req.body
            const { name, street, city, state, pin,  locality, phone} = req.body;
            const findData = await Address.findOne({userId:userId,
                address:{
                    $elemMatch:{
                    locality:locality
                }
                }
            })
        
           if(!findData){
           const f= await Address.findOneAndUpdate({UserId:userId},{$addToSet:{address:{name,street,city,state,pincode:pin,locality,phone}}},{new:true,upsert:true})
            
            res.redirect('/checkout')
           }
        } catch (error) {
            console.log(error.message);
        }
    }

    const removeAddress = async(req,res)=>{
        try {
            const {userId}=req.session
            const {ID}=req.body
            
            const addressData = await Address.findOneAndUpdate({UserId:userId},{$pull:{address:{_id:ID}}},{new:true})
            
        } catch (error) {
            console.log(error.message);
        }
    }


    const chooseAddress = async(req,res)=>{
        try {
            const {addressId}=req.body

            const data = await Address.bulkWrite([
                {
                   updateOne:{
                    filter:{UserId:req.session.userId,'address.status':true},
                    update:{$set:{'address.$.status':false}}
                   } 
                },
                {
                    updateOne:{
                     filter:{UserId:req.session.userId,'address._id':addressId},
                     update:{$set:{'address.$.status':true}}
                    } 
                 },
            ]);

            console.log(addressId);
                } catch (error) {
            console.log(error.message);
        }
    }
    module.exports={
        loadCart,
        addCart,
        priceUpdate,
        remove,
        loadCheckout,
        checkoutDetails,
        removeAddress,
        chooseAddress
    }
    