/* eslint-disable eqeqeq */
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Products = require('../models/product')
const userHelpers = require('../helpers/userdatabase')
const Address = require('../models/address')
const Order = require('../models/order')
const { sendotp, verifyotp } = require('./util/otp')
const crypto = require('crypto')
const Coupons = require('../models/coupon')
const Category = require('../models/category')
const Wishlist = require('../models/wishlist')
const Banner = require('../models/banner')
const nodemailer = require('nodemailer')
const WishList = require('../models/wishlist')
const { validationResult } = require('express-validator')
const AppError = require('../errorhandling/appError')
const mailer = nodemailer.createTransport({
  host: process.env.host,
  port: process.env.ports,
  auth: {
    user: process.env.Email,
    pass: process.env.pass
  }
})
module.exports = {
  home: async (req, res, next) => {
    try {
      const pros = await Products.find().sort({ createdAt: -1 }).limit(12)
      const count = res.locals.count
      let wish = null
      let user = null
      if (req.session.loggedIn) {
        user = req.session.loggedIn
        const id = req.session.loggedIn.user._id
        wish = await WishList.findOne({ user: id })
      // const useer = await User.findById(id)
      // count = useer.count()
      // console.log(count)
      }

      const banners = await Banner.find({})

      res.render('user/home', { uzer: true, admin: false, pros, count, ban: banners, wish, user })
    } catch (e) {
      next(new Error(e))
    }
  },
  login: (req, res, next) => {
    try {
      if (req.session.loggedIn) {
        res.redirect('/')
      } else {
        res.render('user/login', { uzer: false, admin: false })
      }
    } catch (e) {
      next(new Error(e))
    }
  },
  signup: (req, res, next) => {
    try {
      if (req.session.loggedIn) {
        res.redirect('/')
      } else {
        const errorMs = req.flash('signErr')

        res.render('user/signup', { uzer: false, admin: false, errorMsg: errorMs[0], oldInput: { name: '', email: '', phone: '', password: '', confirmPassword: '' }, validateErrors: [] })
      }
    } catch (e) {
      next(new Error(e))
    }
  },
  postSignup: async (req, res, next) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        res.render('user/signup', {
          uzer: false,
          admin: false,
          errorMsg: errors.array()[0].msg,
          oldInput: { name: req.body.name, email: req.body.email, phone: req.body.phone, password: req.body.password, confirmPassword: req.body.confirmPassword },
          validateErrors: errors.array()
        })
      }
      const mobilenum = req.body.phone

      req.session.signup = req.body
      console.log(req.body)

      const uusser = await User.findOne({ email: req.body.email })

      if (uusser) {
        req.flash('signErr', 'Email already Exist')
        res.redirect('/signup')
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
        const ers = req.flash('ers')
        res.render('user/otp.ejs', { uzer: false, num: mobilenum, admin: false, ers })
      }
    } catch (e) {
      next(new Error(e))
    }
  },
  postOtp: async (req, res, next) => {
    try {
      console.log(req.session.signup)
      let { name, email, phone, password, confirmPassword } = req.session.signup
      const otp = req.body.otpis

      await verifyotp(phone, otp).then(async (verificationCheck) => {
        if (verificationCheck.status === 'approved') {
          password = await bcrypt.hash(password, 10)
          confirmPassword = await bcrypt.hash(confirmPassword, 10)
          console.log('otp verifying')
          const members = new User({
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

              req.session.loggedIn = response
              res.redirect('/')
            }
          })
        } else if (verificationCheck.status === 'pending') {
          console.log('otp not match')
          req.flash('ers', 'Wrong Otp')
        }
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  postLogin: (req, res, next) => {
    try {
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
        } else {
          req.session.loggedError = true
          res.redirect('/login')
        }
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  logout: (req, res, next) => {
    try {
      req.session.loggedIn = null
      res.redirect('/login')
    } catch (e) {
      next(new Error(e))
    }
  },
  viewMore: async (req, res, next) => {
    try {
      const id = req.query.id
      let count = null
      count = res.locals.count

      const pro = await Products.findById(id).populate('category')
      console.log(pro)
      res.render('user/singleproduct', { uzer: true, admin: false, pro, count })
    } catch (e) {
      next(new Error(e))
    }
  },
  showCart: async (req, res, next) => {
    try {
      const id = req.session.loggedIn.user._id
      const count = res.locals.count
      const useer = await User.findById(id)
      const cartz = await useer.populate('cart.items.product_id')
      const coupons = await Coupons.find({
        Available: { $gt: 0 }
      })

      console.log(cartz.cart.items)
      res.render('user/cart', { uzer: true, admin: false, cartz, id, coupons, count })
    } catch (e) {
      next(new Error(e))
    }
  },
  cart: async (req, res, next) => {
    try {
      const id = req.session.loggedIn.user._id
      const useer = await User.findById(id)
      const proId = req.query.Proid

      Products.findById(proId).then((product) => {
        if (!product) {
          return next(new AppError('No product found in this Id', 404))
        }
        useer.addCart(product).then(() => {
          res.redirect('/cart')
        }).catch((err) => next(new Error(err)))
      }).catch((e) => {
        console.log(e)
        next(new Error(e))
      })
    } catch (e) {
      console.log(e)
      next(new Error(e))
    }
  },
  ChangeQuantity: async (req, res, next) => {
    try {
      const id = req.session.loggedIn.user._id
      const useer = await User.findById(id)
      // let result ={}
      //     useer.changeQty(req.body.productId,req.body.quantys,req.body.count,(response)=>{
      //        result=response
      //     }).then(()=>{
      //         console.log(result)
      //         res.json(result)
      //     })
      useer.changeQty(req.body.productId, req.body.quantys, req.body.count, (response) => {
        if (response.stock) {
          response.access = true
          res.json(response)
        } else {
          response.access = true

          res.json(response)
        }
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  addCartHome: async (req, res, next) => {
    try {
      const id = req.session.loggedIn.user._id
      const useer = await User.findById(id)
      const proId = req.body.productId

      Products.findById(proId).then((product) => {
        useer.addCart(product).then((response) => {
          const count = useer.count()

          res.json({ response, count, access: true })
        }).catch((err) => console.log(err))
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  profile: async (req, res, next) => {
    try {
      const user = req.session.loggedIn
      const count = res.locals.count

      const useridd = req.session.loggedIn.user._id
      const add = await Address.findOne({ userId: useridd })

      res.render('user/profile', { uzer: true, admin: false, user, add, count })
    } catch (e) {
      next(new Error(e))
    }
  },
  address: async (req, res, next) => {
    try {
      const useridd = req.session.loggedIn.user._id
      const add = await Address.findOne({ userId: useridd })
      if (add) {
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
    } catch (e) {
      next(new Error(e))
    }
  },

  editAddress: async (req, res, next) => {
    try {
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

      addDoc.editAdd(upAd, addId).then((doc) => {
        res.redirect('/profile')
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  deleteAdd: async (req, res, next) => {
    try {
      console.log(req.body)
      const addId = req.body.addressId
      const userid = req.body.uId
      const addDoc = await Address.findOne({ userId: userid })
      addDoc.delete(addId).then((response) => {
        res.status(200).json({ status: true })
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  checkout: async (req, res, next) => {
    try {
      const userId = req.query.user
      const Couponcode = req.query.code
      const count = res.locals.count
      const total = req.query.total
      if (Couponcode !== '') {
        const coupons = await Coupons.findOne({ code: Couponcode })
        if (!coupons) {
          return next(new AppError('No coupon founded in this Id', 404))
        }
        const index = await coupons.userUsed.findIndex(obj => obj.userId == userId)
        if (index >= 0) {
          console.log('user exist')
          req.flash('error', 'Sorry You Already used the coupon')
        // res.redirect('/checkout')
        } else {
          const user = { userId: '' }
          user.userId = userId
          await Coupons.findOneAndUpdate({ code: Couponcode }, { $addToSet: { userUsed: user } })
          const useer = await User.findOne({ _id: userId })
          if (!useer) {
            return next(new AppError('User not found', 404))
          }
          useer.cart.totalPrice = total
          await useer.save()
        }
      }

      const useer = await User.findOne({ _id: userId }).populate('cart.items.product_id')

      const addresses = await Address.findOne({ userId })
      const error = req.flash('error')
      res.render('user/checkout', { uzer: true, admin: false, addresses, userId, useer, error, count })
    } catch (e) {
      next(new Error(e))
    }
  },
  order: async (req, res, next) => {
    try {
      const userId = req.body.Id
      const addresses = req.body.address

      const useer = await User.findOne({ _id: userId })
      const proDetials = useer.cart
      const status = req.body['payment-method'] === 'COD' ? 'Placed' : 'pending'
      const orderObj = {
        user_Id: userId,
        address: addresses,
        cart: proDetials,
        paymentMethod: req.body['payment-method'],
        orderStatus: status,
        date: new Date()
      }
      const od = new Order(orderObj)
      od.save().then(async (doc) => {
        if (req.body['payment-method'] === 'COD') {
          res.json({ paymentSuccess: true })
        } else {
          userHelpers.generateOrder(doc).then((order) => {
            res.json({ order, useer })
          })
        }
        const pro = doc.cart.items
        pro.forEach(async (el) => {
          await Products.findByIdAndUpdate({ _id: el.product_id }, { $inc: { stock: -el.qty } })
        })
        useer.cart.items = []
        useer.cart.totalPrice = null
        await useer.save()
      }).catch((e) => {
        console.log(e)
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  success: (req, res, next) => {
    try {
      res.render('user/success', { uzer: false, admin: false })
    } catch (e) {
      next(new Error(e))
    }
  },
  verifyPayment: (req, res, next) => {
    try {
      userHelpers.paymentVerify(req.body).then(async () => {
        await Order.findOneAndUpdate({ _id: req.body.order.receipt }, {
          $set: { orderStatus: 'Placed' }
        })
        res.json({ status: true })
      }).catch((e) => {
        res.json({ status: false })
        next(new Error(e))
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  forget: (req, res, next) => {
    try {
      res.render('user/forget', { uzer: false, admin: false })
    } catch (e) {
      next(new Error(e))
    }
  },
  postForget: (req, res, next) => {
    try {
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          return next(new Error(err))
        }
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email }).then(users => {
          if (!users) {
            return next(new AppError('No user found', 404))
          }
          users.resetToken = token
          users.resetTokenExpiration = Date.now() + 3600000
          return users.save()
        })
          .then(result => {
            res.redirect('/')
            const emails = {
              to: [result.email],
              from: 'ss1801@srmist.edu.in',
              subject: 'password reseted',

              html: `
            <p>You Requested  a Password reset </p>
             <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a passwor</p>
          `
            }
            mailer.sendMail(emails, function (err, res) {
              if (err) {
                return next(new AppError('Email not sended please wait for sometimes', 404))
              } else {
                console.log(res.response +

            'email sended')
              }
            })
          }).catch(err => {
            next(new Error(err))
          })
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  reset: (req, res, next) => {
    try {
      const token = req.params.token
      User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(users => {
        if (!users) {
          return next(new AppError("Token Generated Didn't match", 404))
        }
        res.render('user/reset', { userid: users._id, uzer: false, admin: false })
      }).catch(err => {
        console.log(err)
        next(new Error(err))
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  Postreset: (req, res, next) => {
    try {
      let updatedUser
      const newpassword = req.body.password
      const userId = req.body.userid
      User.findOne({ _id: userId }).then(users => {
        updatedUser = users
        return bcrypt.hash(newpassword, 12)
      }).then(hashedpassword => {
        updatedUser.password = hashedpassword
        updatedUser.confirmPassword = hashedpassword
        updatedUser.resetToken = undefined
        updatedUser.resetTokenExpiration = undefined
        return updatedUser.save()
      }).then(result => {
        res.redirect('/login')
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  orderList: async (req, res, next) => {
    try {
      const userid = req.session.loggedIn.user._id
      const count = res.locals.count
      // userid = toString(userid)
      const orders = await Order.find({ user_Id: userid })

      const addIds = orders.map((x) => {
        return x.address
      })
      Address.findOne({ userId: userid }).then(async (address) => {
        const result = await address.finding(addIds)
        // console.log(result)

        const od = orders
        console.log(orders[0].cart.items)
        res.render('user/order', { uzer: true, admin: false, od, result, count })
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  orderProduct: async (req, res, next) => {
    try {
      const orderId = req.body.orderId
      const orderDetials = await Order.findOne({ _id: orderId }).populate('cart.items.product_id')
      res.json(orderDetials)
    } catch (e) {
      next(new Error(e))
    }
  },
  wishlist: async (req, res, next) => {
    try {
      const userId = req.session.loggedIn.user._id
      const count = res.locals.count
      const wish = await WishList.findOne({ user: userId }).populate('products.product')

      res.render('user/wishlist', { uzer: true, admin: false, wish, count })
    } catch (e) {
      next(new Error(e))
    }
  },
  couponCheck: async (req, res, next) => {
    try {
      const total = parseInt(req.body.total)
      const coupon = await Coupons.findOne({ code: req.body.code })

      if (coupon && coupon.minCartAmount <= total) {
        const amount = coupon.amount

        const cartTotal = total - amount

        res.json({ status: true, total: cartTotal })
      } else {
        console.log('false')
        res.json({ status: false, message: 'No such coupon' })
      }
    } catch (e) {
      next(new Error(e))
    }
  },
  shopList: async (req, res, next) => {
    try {
      let pagination = false
      let totalproducts = null
      let itemsPerPage = null
      let page = null
      let productList
      const count = res.locals.count
      const typeData = {
        typeListing: 'listing',
        key: null
      }
      if (req.query.cate) {
        console.log('entering cat', req.query)
        try {
          productList = await Products.find({ category: req.query.cate }).populate('category')
        } catch (e) {
          console.log(e)
        }
        typeData.typeListing = 'catListing'
      } else if (req.query.cat) {
        try {
          productList = await Products.find({ category: req.query.cat }).populate('category')
        } catch (e) {
          console.log(e)
        }
        typeData.typeListing = 'catListing'
        res.json({ productList })
        return
      } else if (req.query.q) {
        typeData.typeListing = 'qListing'
        typeData.key = req.query.q
        try {
          const skey = req.query.q
          console.log(skey)

          productList = await Products.find({ _id: skey })
        } catch (e) {
          console.log(e)
        }
      } else if (req.query.p) {
        const skey = req.query.p
        const regex = new RegExp('^' + skey + '.*', 'i')
        productList = await Products.aggregate([{ $match: { $or: [{ title: regex }, { description: regex }, { brand: regex }] } }])
      } else if (parseInt(req.query.page) !== 1) {
        pagination = true
        page = parseInt(req.query.page) || 1
        itemsPerPage = 6
        totalproducts = await Products.find().countDocuments()
        productList = await Products.find().skip((page - 1) * itemsPerPage).limit(itemsPerPage)
        res.json({
          productList,
          pagination,
          page,
          hasNextPage: itemsPerPage * page < totalproducts,
          hasPreviousPage: page > 1,
          PreviousPage: page - 1
        })
        return
      } else {
        pagination = true
        page = parseInt(req.query.page) || 1

        itemsPerPage = 6
        totalproducts = await Products.find().countDocuments()
        productList = await Products.find().skip((page - 1) * itemsPerPage).limit(itemsPerPage)
      }

      const Allcat = await Category.find()
      res.render('user/shop', {
        Allcat,
        productList,
        uzer: true,
        admin: false,
        count,
        pagination,
        page,
        hasNextPage: itemsPerPage * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  search: async (req, res, next) => {
    try {
      const sResult = []
      const skey = req.body.payload
      const regex = new RegExp('^' + skey + '.*', 'i')
      const pros = await Products.aggregate([{ $match: { $or: [{ title: regex }, { description: regex }, { brand: regex }] } }])

      pros.forEach((val, i) => {
        sResult.push({ title: val.title, type: 'Product', id: val._id })
      })
      const catlist = await Category.aggregate([{ $match: { $or: [{ name: regex }, { description: regex }] } }])
      catlist.forEach((val, i) => {
        sResult.push({ title: val.name, type: 'Category', id: val._id })
      })

      res.send({ payload: sResult })
    } catch (e) {
      next(new Error(e))
    }
  },
  invoice: async (req, res, next) => {
    try {
      const count = res.locals.count
      const orderId = req.query.id
      const orderDetials = await Order.findOne({ _id: orderId }).populate('cart.items.product_id')

      const addressId = orderDetials.address

      const address = await Address.findOne({ userId: orderDetials.user_Id })

      const index = address.address.findIndex(obj => obj._id == addressId)

      const finalAddress = address.address[index]

      res.render('user/invoice', { uzer: false, admin: false, orderDetials, finalAddress, count })
    } catch (e) {
      next(new Error(e))
    }
  },
  removeProduct: async (req, res, next) => {
    try {
      const proId = req.query.proId
      const userId = req.query.userId
      const productz = await Products.findOne({ _id: proId })
      const user = await User.findOne({ _id: userId })
      const index = await user.cart.items.findIndex(obj => obj.product_id == proId)
      let qtty = null
      if (index >= 0) {
        qtty = user.cart.items[index].qty
      }
      const dec = productz.price * qtty
      User.updateOne({ _id: userId }, { $pull: { 'cart.items': { product_id: proId } } }).then(() => {
        User.findOneAndUpdate({ _id: userId }, { $inc: { 'cart.totalPrice': -dec } }, { new: true }).then((doc) => {
          const total = doc.cart.totalPrice
          res.json({ total })
        })
      })
    } catch (e) {
      next(new Error(e))
    }
  },
  AddWishlist: async (req, res, next) => {
    try {
      console.log('entering')
      const userId = req.session.loggedIn.user._id
      const pro = req.query.pro
      const wish = await Wishlist.findOne({ user: userId })
      if (wish) {
        const index = wish.products.findIndex(obj => obj.product == pro)
        if (index >= 0) {
          wish.products.splice(index, 1)
          await wish.save()
          res.json({ remove: true })
        } else {
          const pros = { product: pro }
          wish.products.push(pros)
          await wish.save()
          res.json({ added: true })
        }
      } else {
        const wl = new WishList({
          user: userId,
          products: [{ product: pro }]
        })
        wl.save().then((doc) => {
          res.json({ added: true })
          console.log('new oooooooooooooooooooooooooone')
          console.log(doc)
        }).catch((e) => {
          console.log(e)
        })
      }
    } catch (e) {
      next(new Error(e))
    }
  }
}
