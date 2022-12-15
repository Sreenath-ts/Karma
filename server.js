if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const userRouter= require('./routes/user')
const adminRouter = require('./routes/admin')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const nocache = require('nocache')
const multer = require('multer')

const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/images')
    },
    filename:(req,file,cb)=>{
        cb(null,new Date().toISOString().replace(/:/g, '-')+file.originalname)
    }
})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}

app.set('view engine','ejs')
app.set('views',__dirname+'/views')
app.set('layout','layouts/layout')

app.use(nocache())
app.use(expressLayouts)
app.use(express.static('public'))
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).fields([{name:'imagee1'},{name:'imagee2',maxCount:3}]))
// .single('imagee'))  
app.use(express.urlencoded({extended: false}))
app.use(session({secret:'key',cookie:{maxAge:600000},resave:true,saveUninitialized:true}))


const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL,{
    
})
const db = mongoose.connection

db.on('error',(error) => console.error(error))
db.once('open',()=>console.log('Connected to mongoose'))

app.use('/',userRouter)
app.use('/admin',adminRouter)

app.listen(process.env.PORT || 3000,(err)=>{
    if(err) console.log(err)
    else console.log("server running successfully")
})