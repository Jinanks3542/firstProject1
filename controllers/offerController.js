const Offer = require("../model/offerModel");
const product = require("../model/productModel");
const category = require("../model/categoryModel");

const LoadOffer = async (req, res) => {
  try {
    const limit = 4
    const page = parseInt(req.query.page)||1
    const skip = (page-1)*limit
    const totalOfferCount = await Offer.countDocuments()
    const totalPages = Math.ceil(totalOfferCount/limit)
    
    const OfferDetails = await Offer.find().skip(skip).limit(limit).sort({_id:-1});

    res.render("admin/allOffers", {OfferDetails,currentPage:page,totalPages});
  } catch (error) {
    console.log(error.message);
  }
};

const LoadAddOffer = async (req, res) => {
  try {
    res.render("admin/addOffer");
  } catch (error) {
    console.log(error.message);
  }
};

const addOffer = async (req, res) => {
  try {
    const name = req.body.name;
    const offer = req.body.offer;
    console.log(name,offer);
    
    // const offers = await Offer.findOne({offer:offer})
    // console.log(offers,':offers');
    
    
      await Offer.create({
        name: name,
        offer: offer,
      });
  
      res.redirect("/admin/allOffers");
    

  } catch (error) {
    console.log(error.message);
  }
};


const loadEditOffer = async (req, res) => {
  try {
    const id = req.query.id;
    const offers = await Offer.findOne({ _id: id });

    res.render("admin/editOffer", { offers: offers });
  } catch (error) {
    console.log(error.message);
  }
};

const editOffer = async (req, res) => {
  try {
    
    const id = req.query.id;
    const {offerName,percentage}=req.body
    const offers = await Offer.findOne({_id:id}); 
    // console.log(offers.offer);
   
    const ProductOffer = await product.find({offer:offers.offer})

    for(let products of ProductOffer){
      const originalPrice = products.price
      const nwPrice = Math.round(originalPrice/100*(100-percentage))
   
      await product.updateOne({_id:products._id},{$set:{offer:percentage,offerPrice:nwPrice}})
      
    }

    const catOffer = await category.find({offer:offers.offer})
   
    for(let categories of catOffer){
    await category.updateOne({_id:categories._id},{$set:{offer:percentage}})
    }

    const updatedOffer = await Offer.findByIdAndUpdate(id, {
      name: offerName,
      offer: percentage,
    });
   
    res.redirect("/admin/allOffers")

  } catch (error) {
    console.log(error.message);
  }
};


const productOffer = async(req,res)=>{
  
  try {
    const {ProductId,Offer}=req.body

    
    const productOffer = await product.findOne({_id:ProductId})
    
    let offerPrice = Math.round(productOffer.price/100*(100-Offer))
    await product.findOneAndUpdate({_id:ProductId},{$set:{offer:Offer,offerPrice:offerPrice}})
    res.send({offerPrice})
    

  } catch (error) {
    console.log(error.message);
    
  }
}

const categoryOffer = async(req,res)=>{
  try {
    const {categoryId,offer}=req.body

    const catProducts = await product.find({categoryId:categoryId})
    for(let products of catProducts){
     const orginalPrice = products.price
     
     const newPrice = Math.round(orginalPrice / 100 * (100 - offer))
     await category.findOneAndUpdate({_id:categoryId},{$set:{offer:offer}}) 
     await product.updateOne({_id:products._id},{$set:{offer:offer,offerPrice:newPrice}})
    
    }
    

  } catch (error) {
     console.log(error.message);
      
  }
}


const removeOffer = async (req,res)=>{
  try {
      const {offerId}= req.body
      const offers = await Offer.findOne({_id:offerId})  

      const catOfferRemove = await category.find({offer:offers.offer})
      for(let categories of catOfferRemove){
        await category.updateOne({_id:categories._id},{$set:{offer:0}})
      }
      
      const productOfferRemove = await product.find({offer:offers.offer}) 
      for(let products of productOfferRemove){
        await product.updateOne({_id:products._id},{$set:{offer:0,offerPrice:products.price}})
      }
      
    
      await Offer.deleteOne({_id:offerId})
      res.redirect('/admin/allOffers')
      
  } catch (error) {
      console.log(error.message);
  }
}

module.exports = {
  LoadOffer,
  LoadAddOffer,
  addOffer,
  loadEditOffer,
  editOffer,
  removeOffer,
  productOffer,
  categoryOffer,
};




