const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:[true,"Already exist"]
    },
    description:{
        type:String,
        maxlength:100,
        required:true
    },
    image:{
        type:String,
        required:true
    }
},
{timestamps:true}
)

module.exports = mongoose.model('category',categorySchema)