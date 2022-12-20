const bcrypt = require('bcrypt')
const user = require('../models/user')
const products = require('../models/product')
const userHelpers = require('./userDatabase')
const { sendotp, verifyotp } = require('./util/otp')


module.exports = {
    home: async (req, res) => {
        const pros = await products.find()
        let count = null;
        if(req.session.loggedIn){
            const id = req.session.loggedIn.user._id;
            const useer = await user.findById(id)
            count = useer.count()
            console.log(count);
        }
        res.render('user/home', { uzer: true, admin: false, pros,count })
    },
    login: (req, res) => {
        if (req.session.loggedIn) {
            res.redirect('/')
        } else {
            res.render('user/login', { uzer: false, admin: false })
        }
    },
    signup: (req, res) => {
        if (req.session.loggedIn) {
            res.redirect('/')
        } else {
            res.render('user/signup', { uzer: false, admin: false })
        }
    },
    postSignup: async (req, res) => {

        const mobilenum = req.body.phone
        // userData.password = await bcrypt.hash(userData.password, 10)
        // userData.confirmPassword = await bcrypt.hash(userData.confirmPassword, 10)

        req.session.signup = req.body
        console.log(req.body)

        const uusser = await user.findOne({ email: req.body.email })

        if (uusser) {
            res.redirect('/login')
        } else {
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
            res.render('user/otp.ejs', { uzer: false, num: mobilenum, admin: false, error: false })
        }

    },
    postOtp: async (req, res) => {
        try {
            console.log(req.session.signup);
            let { name, email, phone, password, confirmPassword } = req.session.signup
            const otp = req.body.otpis

            await verifyotp(phone, otp).then(async (verification_check) => {
                console.log(verification_check.status + 'hiiii');
                if (verification_check.status == "approved") {
                    console.log(' hhhhhhhhhh');
                    password = await bcrypt.hash(password, 10)
                    confirmPassword = await bcrypt.hash(confirmPassword, 10)
                    console.log('otp verifying');
                    let members = new user({
                        name: name,
                        email: email,
                        phone: phone,
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
                            req.session.loggedIn = newUser;
                            // res.render('user/dummy.ejs',{data:newUser.name})
                            res.redirect('/')
                        }
                    })
                } else if (verification_check.status == "pending") {
                    res.redirect('/signup')
                    console.log('otp not match')
                }
            })


        } catch (e) {
            res.redirect('/signup')
            console.log(e.message);
        }
    },
    postLogin: (req, res) => {
        console.log(req.body)

        userHelpers.dologin(req.body).then((response) => {
            if (response.status) {
                req.session.loggedIn = response
                res.redirect('/')
            } else {
                req.session.loggedError = true
                res.redirect('/login')
            }
        })
    },
    logout: (req, res) => {
        req.session.loggedIn = null
        res.redirect('/login')
    },
    viewMore: async (req, res) => {
        const id = req.query.id
        console.log(id);
        const pro = await products.findById(id).populate('category')
        console.log(pro);
        res.render('user/singleProduct', { uzer: true, admin: false, pro })
    },
    showCart: async (req, res) => {
        const id = req.session.loggedIn.user._id;
        const useer = await user.findById(id)
        const cartz = await useer.populate("cart.items.product_id")
        console.log(cartz)
        console.log(cartz.cart.items);
        res.render('user/cart', { uzer: true, admin: false, cartz })
    },
    cart: async (req, res) => {
        const id = req.session.loggedIn.user._id;
        const useer = await user.findById(id)
        const proId = req.query.Proid
        console.log(proId + 'jiijii');
        products.findById(proId).then((product) => {
            console.log(product + 'koi');
            useer.addCart(product).then(() => {
                res.redirect('/cart')
            }).catch((err) => console.log(err))
        })
    },
    ChangeQuantity:async(req,res)=>{
        const id = req.session.loggedIn.user._id;
        const useer = await user.findById(id)
        // let result ={}
    //     useer.changeQty(req.body.productId,req.body.quantys,req.body.count,(response)=>{
    //        result=response
    //     }).then(()=>{
    //         console.log(result)
    //         res.json(result)
    //     })
    useer.changeQty(req.body.productId,req.body.quantys,req.body.count,(response)=>{
        response.access = true
        console.log(response);
        res.json(response)
    })
 },
 addCartHome:async(req,res)=>{
    const id = req.session.loggedIn.user._id;
    const useer = await user.findById(id)
    const proId = req.body.productId
   
    products.findById(proId).then((product) => {
        console.log(product + 'koi');
        useer.addCart(product).then((response) => {
            count = useer.count()
            
            res.json({response,count,access:true})
        }).catch((err) => console.log(err))
    })
 }
}