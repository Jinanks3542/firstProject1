const mongoose = require('mongoose')
function connectDb(){
    
    mongoose.connect('mongodb://127.0.0.1:27017/firstProject')
}
