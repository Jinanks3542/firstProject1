const express = require('express')
const app = express()
require('dotenv').config();
<<<<<<< HEAD
const mongoose = require('mongoose')
mongoose.connect(process.env.mongodbUrl).then(() => {
    console.log('moongodb conneted.')
}).catch((error) => {
    console.error(error + "        mongodb connection error.")
=======
const mongoose = require('mongoose');
mongoose.connect(process.env.mongodbUrl).then(() => {
    console.log('moongodb conneted.');
}).catch((error) => {
    console.error(error + "mongodb connection error.")
>>>>>>> f549f2d0fe99e5c7dffe86d246eae6e347de69c0
})
const path = require('path')
const userRoute=require('./routes/userRoute')
const adminRoute =require('./routes/adminRoute')
const Razorpay = require('razorpay')
const flash = require('express-flash')
const session=require('express-session')
const nocache = require('nocache')
app.set('view engine','ejs')
app.use(express.json())

app.use(flash())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))


app.use('/',userRoute)
app.use('/admin',adminRoute)

const port=3000

app.listen(port,()=>{
    console.log(`Server is running`)
})

// app.listen(3000,()=>console.log('server running'))
