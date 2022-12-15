const mongoose = require('mongoose')
// const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        requied:true
    },
    password:{
        type:String,
        required:true
    },
    confirmPassword:{
        type:String,
        required:true,
        // validate:{
        //     validator:function(el){
        //         return el === this.password 
        //     }
        // }
    },
    access:{
        type:Boolean,
        default:true
      }
})

module.exports=mongoose.model('user',userSchema)