const bcrypt = require('bcrypt')
const user = require('../models/user')
const products = require('../models/product')
const userHelpers = require('../helpers/userDatabase')
const Address = require('../models/address')
const order = require('../models/order')
const { sendotp, verifyotp } = require('./util/otp')

// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey('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')
const nodemailer = require('nodemailer')

const mailer = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  auth: {
    user: 'sayeedmon25@gmail.com',
    pass: 'aqRAg1wBWHTyznj3'
  }
})
module.exports = {
  home: async (req, res) => {
    const pros = await products.find()
    let count = null
    if (req.session.loggedIn) {
      const id = req.session.loggedIn.user._id
      const useer = await user.findById(id)
      count = useer.count()
      console.log(count)
    }
    res.render('user/home', { uzer: true, admin: false, pros, count })
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
      console.log(req.session.signup)
      let { name, email, phone, password, confirmPassword } = req.session.signup
      const otp = req.body.otpis

      await verifyotp(phone, otp).then(async (verification_check) => {
        console.log(verification_check.status + 'hiiii')
        if (verification_check.status == 'approved') {
          console.log(' hhhhhhhhhh')
          password = await bcrypt.hash(password, 10)
          confirmPassword = await bcrypt.hash(confirmPassword, 10)
          console.log('otp verifying')
          const members = new user({
            name,
            email,
            phone,
            password,
            confirmPassword
          })
          console.log(members)

          members.save((err, newUser) => {
            if (err) {
              console.log(err.message)
              res.redirect('/signup')
            } else {
              const response = { user: newUser }
              console.log(response)
              req.session.loggedIn = response

              res.redirect('/')
            }
          })
        } else if (verification_check.status === 'pending') {
          console.log('otp not match')
          res.redirect('/signup')
        }
      })
    } catch (e) {
      res.redirect('/signup')
      console.log(e.message)
    }
  },
  postLogin: (req, res) => {
    console.log(req.body)

    userHelpers.dologin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = response
        res.redirect('/')
        console.log(typeof response.user.email)
        // const msg = {
        //   to: response.user.email, // Change to your recipient
        //   from: 'sreenathkunjan2001@gmail.com', // Change to your verified sender
        //   subject: 'Sending with SendGrid is Fun',
        //   text: 'and easy to do anywhere, even with Node.js',
        //   html: '<strong>and easy to do anywhere, even with Node.js</strong>'
        // }
        // sgMail
        //   .send(msg)
        //   .then(() => {
        //     console.log('Email sent')
        //   })
        //   .catch((error) => {
        //     console.error(error)
        //   })

        const email = {
          to: response.user.email,
          from: 'sreenathkunjan2001@gmail.com',
          subject: 'Signin notification!',
          text: 'We welcomes you to Karma Ecommerce'
        }
        mailer.sendMail(email, function (err, res) {
          if (err) {
            console.log(err)
          } else {
            console.log(res.response + 'email sended')
          }
        })
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
    console.log(id)
    const pro = await products.findById(id).populate('category')
    console.log(pro)
    res.render('user/singleProduct', { uzer: true, admin: false, pro })
  },
  showCart: async (req, res) => {
    const id = req.session.loggedIn.user._id
    console.log(id + 'hereeeee')
    const useer = await user.findById(id)
    const cartz = await useer.populate('cart.items.product_id')
    console.log(cartz)
    console.log(cartz.cart.items)
    res.render('user/cart', { uzer: true, admin: false, cartz, id })
  },
  cart: async (req, res) => {
    const id = req.session.loggedIn.user._id
    const useer = await user.findById(id)
    const proId = req.query.Proid
    console.log(proId + 'jiijii')
    products.findById(proId).then((product) => {
      console.log(product + 'koi')
      useer.addCart(product).then(() => {
        res.redirect('/cart')
      }).catch((err) => console.log(err))
    })
  },
  ChangeQuantity: async (req, res) => {
    const id = req.session.loggedIn.user._id
    const useer = await user.findById(id)
    // let result ={}
    //     useer.changeQty(req.body.productId,req.body.quantys,req.body.count,(response)=>{
    //        result=response
    //     }).then(()=>{
    //         console.log(result)
    //         res.json(result)
    //     })
    useer.changeQty(req.body.productId, req.body.quantys, req.body.count, (response) => {
      response.access = true
      console.log(response)
      res.json(response)
    })
  },
  addCartHome: async (req, res) => {
    const id = req.session.loggedIn.user._id
    const useer = await user.findById(id)
    const proId = req.body.productId

    products.findById(proId).then((product) => {
      console.log(product + 'koi')
      useer.addCart(product).then((response) => {
        const count = useer.count()

        res.json({ response, count, access: true })
      }).catch((err) => console.log(err))
    })
  },
  profile: async (req, res) => {
    const user = req.session.loggedIn
    console.log(user)
    const useridd = req.session.loggedIn.user._id
    const add = await Address.findOne({ userId: useridd })
    console.log(add)
    res.render('user/profile', { uzer: true, admin: false, user, add })
  },
  address: async (req, res) => {
    console.log(req.body)
    const useridd = req.session.loggedIn.user._id
    const add = await Address.findOne({ userId: useridd })
    if (add) {
      console.log('keriyeee')
      await Address.updateOne({ userId: useridd }, { $push: { address: req.body } })
      res.status(200).json({ status: true })
    } else {
      req.body.status = true
      const ad = new Address({
        address: [req.body],
        userId: useridd
      })
      ad.save((err, doc) => {
        if (err) console.log(err)
        else {
          console.log(doc)
          res.json({ status: true })
        }
      })
    }
  },

  editAddress: async (req, res) => {
    const addId = req.params.id
    const userid = req.body.userId
    const upAd = {
      name: req.body.name,
      mob: req.body.mob,
      house: req.body.house,
      landmark: req.body.landmark,
      city: req.body.city,
      district: req.body.district,
      state: req.body.state,
      pincode: req.body.pincode
    }
    const addDoc = await Address.findOne({ userId: userid })
    console.log(addDoc)
    addDoc.editAdd(upAd, addId).then((doc) => {
      res.redirect('/profile')
    })
  },
  deleteAdd: async (req, res) => {
    console.log(req.body)
    const addId = req.body.addressId
    const userid = req.body.uId
    const addDoc = await Address.findOne({ userId: userid })
    addDoc.delete(addId).then((response) => {
      res.status(200).json({ status: true })
    })
  },
  checkout: async (req, res) => {
    const userId = req.query.user
    console.log(userId + 'unknown')
    const useer = await user.findOne({ _id: userId }).populate('cart.items.product_id')
    console.log(useer + 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
    const addresses = await Address.findOne({ userId })
    res.render('user/checkout', { uzer: true, admin: false, addresses, userId, useer })
  },
  order: async (req, res) => {
    console.log(req.body)
    const userId = req.body.Id
    console.log(userId + 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')
    const addresses = req.body.address
    const useer = await user.findOne({ _id: userId })
    const proDetials = useer.cart
    const addDetials = await Address.findOne({ userId, 'adress._id': addresses })
    const index = await addDetials.address.findIndex(obj => obj._id == addresses)
    const orderAddress = addDetials.address[index]

    const status = req.body['payment-method'] === 'COD' ? 'Placed' : 'pending'
    const orderObj = {
      user_Id: userId,
      address: addresses,
      products: [proDetials],
      paymentMethod: req.body['payment-method'],
      orderStatus: status,
      date: new Date()
    }
    const od = new order(orderObj)
    od.save().then(async (doc) => {
      if (req.body['payment-method'] === 'COD') {
        res.json({ paymentSuccess: true })
      } else {
        userHelpers.generateOrder(doc).then((order) => {
          res.json({ order, useer })
        })
      }
      const pro = doc.products[0].items
      pro.forEach(async (el) => {
        await products.findByIdAndUpdate({ _id: el.product_id }, { $inc: { stock: -el.qty } })
      })
      useer.cart.items = []
      useer.cart.totalPrice = null
      await useer.save()
    }).catch((e) => {
      console.log(e)
    })
  },
  success: (req, res) => {
    res.render('user/success', { uzer: false, admin: false })
  },
  verifyPayment: (req, res) => {
    console.log(req.body)
    userHelpers.paymentVerify(req.body).then(async () => {
      console.log('payment success')
      await order.findOneAndUpdate({ _id: req.body.order.receipt }, {
        $set: { orderStatus: 'Placed' }
      })
      res.json({ status: true })
    }).catch((e) => {
      res.json({ status: false })
      console.log(e)
    })
  },
  forget: (req, res) => {
    res.render('user/forget', { uzer: false, admin: false })
  },
  postForget: (req, res) => {
    console.log(req.body)
  },
  orderList: async (req, res) => {
    const userid = req.session.loggedIn.user._id
    const orders = await order.aggregate([{

      $lookup: {
        from: Address.collection.name,
        localField: 'address',
        foreignField: 'address._id',
        as: 'orders'
      }
    }])
    console.log(orders)
    // const addressId = orders.map((x) => {
    //   return x.address
    // })
    // console.log(addressId)
    res.render('user/order', { uzer: true, admin: false })
  }
}
