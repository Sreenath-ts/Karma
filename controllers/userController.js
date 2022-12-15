const bcrypt = require('bcrypt')
const user = require('../models/user')
const userHelpers = require('./userDatabase')
const {sendotp,verifyotp} = require('./util/otp')

module.exports = {
    home: (req, res) => {
        res.render('user/home',{uzer:true,admin:false})
    },
    login: (req, res) => {
        if(req.session.loggedIn){
            res.redirect('/')
        }else{
            res.render('user/login',{uzer:false,admin:false})
        }
    },
    signup: (req, res) => {
        if(req.session.loggedIn){
            res.redirect('/')
        }else{
            res.render('user/signup',{uzer:false,admin:false})
        }
    },
    postSignup: async (req, res) => {
       
        const mobilenum = req.body.phone
        // userData.password = await bcrypt.hash(userData.password, 10)
        // userData.confirmPassword = await bcrypt.hash(userData.confirmPassword, 10)

        req.session.signup=req.body
        console.log(req.body)

        const uusser = await user.findOne({email:req.body.email})

        if(uusser){
            res.redirect('/login')
        }else{
            // let {name,email,phone,password,confirmPassword}=req.session.signup
            // password = await bcrypt.hash(password, 10)
            // confirmPassword = await bcrypt.hash(confirmPassword, 10)
            // console.log('otp verifying');
            // let members = new user({
            //     name: name,
            //     email: email,
            //     phone:phone,
            //     password: password,
            //     confirmPassword: confirmPassword
            // })
            // console.log(members);
            // members.save()
            // res.redirect('/signup')
            sendotp(mobilenum)
            res.render('user/otp.ejs',{uzer:false,num:mobilenum,admin:false,error:false})
        }

    },
    postOtp:async(req,res)=>{
        try{
         console.log(req.session.signup);
         let {name,email,phone,password,confirmPassword}=req.session.signup
         const otp = req.body.otpis

          await verifyotp(phone,otp).then(async(verification_check)=>{
            if(verification_check.status=="approved"){
                console.log(' hhhhhhhhhh');
                password = await bcrypt.hash(password, 10)
                confirmPassword = await bcrypt.hash(confirmPassword, 10)
                console.log('otp verifying');
                let members = new user({
                    name: name,
                    email: email,
                    phone:phone,
                    password: password,
                    confirmPassword: confirmPassword
                })
                console.log(members);
                members.save((err, newUser) => {
                    if (err) {
                        console.log(err.message)
                        res.redirect('/signup')
                    }
                    else {
                       req.session.loggedIn=true
                        // res.render('user/dummy.ejs',{data:newUser.name})
                        res.redirect('/')
                    }
                })
            }else if(verification_check.status=="pending"){
               res.redirect('/signup')
                console.log('otp not match')
            }
          })

       
        }catch(e){
          res.redirect('/signup')
            console.log(e.message);
        }
    },
    postLogin:  (req, res) => {
        console.log(req.body)
        
       userHelpers.dologin(req.body).then((response)=>{
        if(response.status){
            req.session.loggedIn=true
            res.redirect('/')
        }else{
            req.session.loggedError=true
            res.redirect('/login')
        }
       })
    },
    logout : (req,res) =>{
        req.session.loggedIn=null
        res.redirect('/login')
    }
}