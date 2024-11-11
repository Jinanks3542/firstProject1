    const User = require('../model/userModel')
    const Cart = require('../model/cartModel');
    const Product = require('../model/productModel');
    const Address = require('../model/addressModel')
    const Coupon = require('../model/coupenModel')


 
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


    const couponApply = async(req,res)=>{
        try {    

            const gettingCode = await User.findOne({_id:req.session.userId,'coupons.code':req.body.code},{'coupons.$':1}).populate('coupons.couponId')
            let percentage
            let min
          
            if(gettingCode.coupons[0].couponStatus=='Claimed'||gettingCode.coupons[0].couponStatus=='Expired'){


                const cartData = await  Cart.find({userId:req.session.userId}).populate('products.productId')

                
                
                let quantityTotal=0
                let cartAmountTotal=0
                cartData.products.forEach(data => {
                    quantityTotal=data.productId.offerPrice*data.quantity
                    cartAmountTotal = cartAmountTotal+quantityTotal
                });
                res.json({msg:'Your Coupon has already been claimed',total:cartAmountTotal,discount:0})

            }else{
              
                gettingCode.coupons.forEach((couponData) => {

                    percentage=couponData.couponId.offer
                    
                    
                    min = couponData.couponId.min
                   
                    

                });

                req.session.Coupon=percentage
                req.session.code=req.body.code
                const cartDatas = await Cart.findOne({userId:req.session.userId}).populate('products.productId')
                let quantityTotal =0
                let cartAmountTotal=0

                cartDatas.products.forEach((Data)=>{
                    quantityTotal=Data.productId.offerPrice*Data.quantity
                    cartAmountTotal=cartAmountTotal+quantityTotal
                })

                if(cartAmountTotal>min){
                    const discountPrice = Math.round(cartAmountTotal-cartAmountTotal/100*(100-percentage ))
                    let totalAmount = cartAmountTotal- discountPrice
                    req.session.totalOrderAmount = totalAmount
                    res.json({discount:discountPrice,total:totalAmount})
                }else{
                    res.json({err:'Invalid Amount',total:cartAmountTotal,discount:0})
                }
                
            }

        } catch (error) {
            console.log(error.message);
            
        }
    }


    const removeCoupon = async(req,res)=>{
        try {
            const cartData = await Cart.findOne({userId:req.session.userId}).populate('products.productId').exec()
            
            let grandTotal=0
            cartData.products.forEach(item=>{
                grandTotal+=item.productId.offerPrice*item.quantity
            })
            
            req.session.Coupon=null
            req.session.code=null

            res.json({success:true, total:grandTotal})

        } catch (error) {
            console.log(error.message);
            res.json({success:false})
            
        }
    }

    

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
              //console.log(cartDetail,'cart detail');
            //   let i = 0
            //   let  totalAmount =0
            //   while(i<cartDetail.products.length){
            //     let iddd = cartDetail.products[i]?.productId
            //     let product = await Product.findOne({_id:cartDetail.products[i].productId})
            //     let productPrice = product.price
            //     let aa = productPrice*cartDetail.products[i].quantity
            //       totalAmount+=aa
                  
            //       i++

            //   }
              
              const addressDocuments=await Address.find({UserId:userId}).sort({_id:-1}).limit(3)
           
            const addresses = addressDocuments.length > 0 ? addressDocuments[0].address.slice(-3).reverse() : []; 
            const couponsData = await User.findOne({_id:userId}).populate('coupons.couponId')
            
            
            res.render('user/checkout',{cartDetail,addresses,couponsData})

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
           await Address.findOneAndUpdate({UserId:userId},{$addToSet:{address:{name,street,city,state,pincode:pin,locality,phone}}},{new:true,upsert:true})
            
            res.json({success:true})
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
            if(addressData){
                res.json({success:true})
            }
            
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

                } catch (error) {
            console.log(error.message);
        }
    }


    const editAddress = async (req,res)=>{
        try {
            const {editID} = req.body

            const getEditedAddress = await Address.findOne({'address._id':editID},{'address.$':1})
            //console.log(getEditedAddress,':getEditedAddress');
            
            if(getEditedAddress){
                const Address = getEditedAddress.address[0]
                res.json({
                    name:Address.name,
                    phone:Address.phone,
                    pincode:Address.pincode,
                    street:Address.street,
                    locality:Address.locality,
                    state:Address.state,
                    city:Address.city,
                    addressId:Address._id
                })
            }else{
                res.status(404).json({message:'address not found'})
            }

        } catch (error) {
            console.log(error.message);
            
        }
    }


    const saveEditData = async(req,res)=>{
        try {
            const {userId}=req.session
            const {name, phone, pinCode, street, locality, state, city, addressId} = req.body
            
            const updateAddress = await Address.updateOne({UserId:userId,'address._id':addressId},

                {$set:
                {
                    'address.$.name':name,
                    'address.$.phone':phone,
                    'address.$.pincode':pinCode,
                    'address.$.street':street,
                    'address.$.locality':locality,
                    'address.$.state':state,
                    'address.$.city':city,

                }})
                
                res.json({success:true})
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
        chooseAddress,
        editAddress,
        saveEditData,
        couponApply,
        removeCoupon
    }
    
    