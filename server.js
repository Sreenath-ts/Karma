if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const userRouter= require('./routes/user')
const expressLayouts = require('express-ejs-layouts')

app.set('view engine','ejs')
app.set('views',__dirname+'/views')
app.set('layout','layouts/layout')

app.use(expressLayouts)
app.use(express.static('public'))

const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection

db.on('error',(error) => console.error(error))
db.once('open',()=>console.log('Connected to mongoose'))

app.use('/',userRouter)


app.listen(process.env.PORT || 3000,(err)=>{
    if(err) console.log(err)
    else console.log("server running successfully")
})