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
        res.redirect('/home')
    }else{
        next()
    }
}

const isblocked= async (req,res,next)=>{
    const id = req.session.userId
    console.log('id',id);
    const user = await User.findOne({_id:id})
    if(user.is_blocked){
        req.session.userId=null
        res.redirect('/')
    }else{
        next()
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
