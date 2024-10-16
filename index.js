const express = require('express')
const app = express()
const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/firstProject')
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
    console.log(`Server is running on http://localhost:${port}`)
})

// app.listen(3000,()=>console.log('server running'))
