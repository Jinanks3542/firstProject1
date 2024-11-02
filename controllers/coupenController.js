const Coupon = require('../model/coupenModel')
const User = require('../model/userModel')


const generatecode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code+= characters.charAt(randomIndex);
    }
    return code;
};


const LoadCoupen = async (req,res)=>{
    try {
        
        const coupons = await Coupon.find()
       res.render('admin/allCoupen',{coupons}) 
       
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddCoupen = async (req,res)=>{
    try {
        res.render('admin/addCoupen')
    } catch (error) {
        console.log(error.message);
    }
}

// const addCoupen = async (req,res)=>{
//     try {
//         const {name,buyMinPrice,buyMaxPrice,discountAmount,minPrice,description}=req.body

//         const validity=parseInt(req.body.validity)
//         const currentDate = new Date();
//         const expiryDate = new Date(currentDate);
//         expiryDate.setDate(currentDate.getDate() + validity);
//         await Coupon.create({
//             name:name,
//             min:minPrice,
//             expiryDate:expiryDate,
//             offer:discountAmount,
//             code:generatecode(),
//             dataDuration:validity,
//             description:description,
//             buyLow:buyMinPrice,
//             buyHigh:buyMaxPrice
//         })
//         res.redirect('/admin/allcoupen')
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const addCoupen = async (req, res) => {
    try {
        const { name, buyMinPrice, buyMaxPrice, discountAmount, minPrice, validityy, description } = req.body;

        
        console.log(req.body.name)
        const validityPeriod = parseInt(validityy);
        console.log(validityy,":Validity");
        console.log(validityPeriod,":validityPeriod");
        
        if (isNaN(validityPeriod)) {
            throw new Error('Invalid coupon validity period');
        }

        const currentDate = new Date();
        const expiryDate = new Date(currentDate);
        expiryDate.setDate(currentDate.getDate() + validityPeriod);

        await Coupon.create({
            name: name,
            min: minPrice,
            expiryDate: expiryDate,
            offer: discountAmount,
            code: generatecode(),
            dataDuration: validityy,
            description: description,
            buyLow: buyMinPrice,
            buyHigh: buyMaxPrice
        });

        res.redirect('/admin/allcoupen');
    } catch (error) {
        console.log(error.message);
    }
};




const loadEditCoupen = async (req,res)=>{
    try {
        const {id}=req.query
        const coupons = await Coupon.findOne({_id:id})
       
         
        res.render('admin/editCoupen',{coupons})
    } catch (error) {
        console.log(error.message);
    }
}

const editCoupen = async(req,res)=>{
    try {
        const {id}=req.query
        const {couponName,percentage,expiryDate,description}=req.body
        const currentDate = new Date();
        const validity = new Date(currentDate);
        validity.setDate(currentDate.getDate() + parseInt(expiryDate));
        await Coupon.findOneAndUpdate({_id:id},{$set:{name:couponName,offer:percentage,dataDuration:expiryDate,buyMin:Min,buyHigh:Max}})

        res.redirect('/admin/allCoupen')
    } catch (error) {
        console.log(error.message);
    }
}


const removeCoupon = async (req,res)=>{
    
    try {
        const {couponId}=req.body
       
        const rmCoupons = await Coupon.findOne({_id:couponId}) 
       
        await Coupon.deleteOne({_id:couponId})
        res.redirect('/admin/allCoupon')
    } catch (error) {
        console.log(error.message);
        
    }
}





module.exports={
    LoadCoupen,
    loadAddCoupen,
    addCoupen,
    loadEditCoupen,
    editCoupen,
    removeCoupon,
    
}