const User = require('../model/userModel')

const noUserLogin = (req,res,next)=>{
    if(req.session.userId){
        next()
    }else{
        res.redirect('/login')
    }
}


const userLogin = (req,res,next)=>{
    if(req.session.userId){
        res.redirect('/')
    }else{
        next()
    }
}

const isblocked= async (req,res,next)=>{
    const id = req.session.userId
    
    const user = await User.findOne({_id:id})
    if(!user.is_blocked){
        next()
        
    }else{
        req.session.userId=null
        res.redirect('/login')
    }
}

const myAccountauthorize = async(req,res,next)=>{
    if(!req.session.userId){
        next()

    }else{
        res.redirect('/myAccount')
    }
}

module.exports={
    noUserLogin,
    userLogin,
    isblocked,
    myAccountauthorize,
}
