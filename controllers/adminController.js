const adminEmail = process.env.AdminEmail
const adminPassword = process.env.AdminPassword
// const flash = require('connect-flash')
const { handleDuplicate } = require('../errorhandling/dbErrors')
const Coupon = require('../models/coupon')
const Category = require('../models/category')
const user = require('../models/user')
const Products = require('../models/product')
const Banner = require('../models/banner')
const Order = require('../models/order')
const Address = require('../models/address')

module.exports = {

  dash: async (req, res) => {
    const revenue = await Order.aggregate([{ $match: { $or: [{ $and: [{ paymentMethod: 'COD', orderStatus: 'delivered' }] }, { $and: [{ paymentMethod: 'OP', orderStatus: 'placed' }] }] } },
      {
        $group: {
          _id: {
            id: null
          },
          totalPrice: { $sum: '$cart.totalPrice' },
          items: { $sum: { $size: '$cart.items' } },
          count: { $sum: 1 }
        }
      }
    ])

    const Allsales = await Order.aggregate([{ $match: { orderStatus: { $ne: 'cancelled' } } }, {
      $group: {
        _id: {
          id: null
        },
        totalPrice: { $sum: '$cart.totalPrice' },
        items: { $sum: { $size: '$cart.items' } },
        count: { $sum: 1 }
      }
    }])
    const date = new Date()
    console.log(date, 'date')
    let month = date.getMonth()
    month = month + 1
    const year = date.getFullYear()
    console.log(month, 'ipo month', year, 'ipo year')
    const day = date.getDate()

    const TodayRevenue = await Order.aggregate([{ $match: { $or: [{ $and: [{ paymentMethod: 'COD', orderStatus: 'delivered' }] }, { $and: [{ paymentMethod: 'OP', orderStatus: 'placed' }] }] } },
      { $addFields: { Day: { $dayOfMonth: '$createdAt' }, Month: { $month: '$createdAt' }, Year: { $year: '$createdAt' } } },
      {
        $match: { Day: day, Year: year, Month: month }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$createdAt' }
          },
          totalPrice: { $sum: '$cart.totalPrice' },

          count: { $sum: 1 }
        }
      }

    ])

    const TodaySale = await Order.aggregate([{ $match: { orderStatus: { $ne: 'cancelled' } } },
      { $addFields: { Day: { $dayOfMonth: '$createdAt' }, Month: { $month: '$createdAt' }, Year: { $year: '$createdAt' } } },
      {
        $match: { Day: day, Year: year, Month: month }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$createdAt' }
          },
          totalPrice: { $sum: '$cart.totalPrice' },
          items: { $sum: { $size: '$cart.items' } },
          count: { $sum: 1 }
        }
      }])

    res.render('admin/dash', { uzer: false, admin: true, TodaySale, TodayRevenue, Allsales, revenue })
  },
  userpage: async (req, res) => {
    const userlist = await user.find()
    console.log(userlist)
    res.render('admin/userlist', { uzer: false, admin: true, userlist })
  },
  block: async (req, res) => {
    console.log(req.params.id)
    const id = req.params.id
    await user.findByIdAndUpdate(id, { access: false })

    res.redirect('/admin/userlist')
  },
  unblock: async (req, res) => {
    const _id = req.params.id
    await user.findByIdAndUpdate(_id, { access: true }, {})

    res.redirect('/admin/userlist')
  },
  addcategory: (req, res) => {
    const errors = req.flash('error')
    res.render('admin/addcategory', { uzer: false, admin: true, errors })
  },
  postaddcategory: async (req, res) => {
    console.log(req.body)

    const image = req.files.imagee1

    if (!image) {
      req.flash('error', 'File is not a image')
      res.redirect('/admin/addcategory')
    } else {
      let imageUrl = image[0].path
      console.log(imageUrl)
      imageUrl = imageUrl.substring(6)

      console.log('hoooooooooooooooooo' + imageUrl)
      const newCategory = new Category({
        name: req.body.categoryName,
        description: req.body.description,
        image: imageUrl
      })
      newCategory
        .save()
        .then((newOne) => {
          console.log(newOne)
          res.redirect('/admin/category')
        })
        .catch((err) => {
          const error = { ...err }
          console.log(error.code)
          let errors
          if (error.code === 11000) {
            errors = handleDuplicate(error)
            res.render('admin/addcategory', { uzer: false, admin: true, errors })
          }
        })
    }
  },
  listcategory: async (req, res) => {
    const cate = await Category.find()

    res.render('admin/categoryview', { uzer: false, admin: true, cate })
  },
  editCate: async (req, res) => {
    const iid = req.query.id
    console.log(iid)

    const oneUser = await Category.findOne({ _id: iid })
    console.log(oneUser + 'hiii')
    res.render('admin/editcategory', { uzer: false, admin: true, oneUser })
  },
  postEditCategory: async (req, res) => {
    console.log(req.body)

    const id = req.params.id
    const updatedName = req.body.categoryName.trim()
    const updatedDescription = req.body.description.trim()
    // console.log(req.files);
    // console.log(req.files.path);
    const image = req.files.imagee1
    const cat = { name: updatedName, description: updatedDescription }
    if (image) {
      const imageUrl = image[0].path.substring(6)
      cat.image = imageUrl
    }
    await Category.updateOne(
      { _id: id },
      {
        $set: {
          name: cat.name,
          description: cat.description,
          image: cat.image
        }
      }
    )
    res.redirect('/admin/category')
  },
  delCat: (req, res) => {
    const id = req.params.id
    console.log(id)
    Category
      .deleteOne({ _id: id })
      .then((doc) => {
        console.log(doc)
      })
      .catch((e) => console.log(e))
    res.redirect('/admin/category')
  },
  products: async (req, res) => {
    const pros = await Products.find()
    res.render('admin/products', { uzer: false, admin: true, pros })
  },
  addPro: async (req, res) => {
    const categories = await Category.find()
    res.render('admin/addpro', { uzer: false, admin: true, categories })
  },
  addProPost: (req, res) => {
    const image = req.files.imagee2

    const img = []
    image.forEach((el, i, arr) => {
      img.push(arr[i].path.substring(6))
    })

    console.log(img)

    const productz = new Products({
      title: req.body.title,
      brand: req.body.brand,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category.trim(),
      image: img,
      description: req.body.description,
      discount: req.body.discount,
      size: req.body.size
    })
    productz.save((error, doc) => {
      if (error) {
        res.redirect('/admin/addPro')
      } else {
        console.log(doc)
        res.redirect('/admin/products')
      }
    })
  },
  adminLogin: (req, res) => {
    if (req.session.admin) {
      res.redirect('/admin')
    } else {
      const error = req.session.adminLogErr

      res.render('admin/adminlogin', { uzer: false, admin: false, error })

      req.session.adminLogErr = null
    }
  },
  adminPOst: (req, res) => {
    console.log(req.body)
    const admin = req.body.email
    const password = req.body.password
    if (admin === adminEmail && password === adminPassword) {
      req.session.admin = true
      res.redirect('/admin')
    } else {
      req.session.adminLogErr = true
      res.redirect('/admin/adminLogin')
    }
  },
  logout: (req, res) => {
    req.session.admin = null
    res.redirect('/admin/adminLogin')
  },
  editPro: async (req, res) => {
    const id = req.query.id
    const categories = await Category.find()
    const pros = await Products.findOne({ _id: id }).populate('category')
    console.log(pros.category)
    res.render('admin/editpro', { uzer: false, admin: true, pros, categories })
  },
  postEditPro: async (req, res) => {
    console.log(req.body)
    const id = req.params.id
    console.log(id)
    const image = req.files.imagee2
    const pro = {
      title: req.body.title,
      brand: req.body.brand,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      description: req.body.description,
      discount: req.body.discount,
      size: req.body.size
    }
    if (image) {
      const img = []
      image.forEach((el, i, arr) => {
        img.push(arr[i].path.substring(6))
      })

      await Products.updateOne(
        { _id: id },
        {
          $set: {
            title: pro.title,
            brand: pro.brand,
            price: pro.price,
            stock: pro.stock,
            category: pro.category.trim(),
            image: img,
            description: pro.description,
            discount: pro.discount,
            size: pro.size
          }
        }
      )
    } else {
      await Products.updateOne(
        { _id: id },
        {
          $set: {
            title: pro.title,
            brand: pro.brand,
            price: pro.price,
            stock: pro.stock,
            category: pro.category.trim(),
            description: pro.description,
            discount: pro.discount,
            size: pro.size
          }
        }
      )
    }

    res.redirect('/admin/products')
  },
  deletePro: (req, res) => {
    const id = req.params.id
    console.log(id)
    Products
      .deleteOne({ _id: id })
      .then(() => {
        res.redirect('/admin/products')
      })
      .catch((e) => {
        res.redirect('/admin/products')
        console.log(e)
      })
  },
  addCoupons: (req, res) => {
    res.render('admin/addcoupons', { uzer: false, admin: true })
  },
  postAddCoupons: (req, res) => {
    const coupon = new Coupon(req.body)
    coupon.save().then((doc) => {
      res.redirect('/admin/add-coupon')
      console.log('added')
    }).catch((e) => {
      console.log(e)
    })
  },
  bannerAdd: (req, res) => {
    const error = req.flash('errorz')
    res.render('admin/addbanner', { uzer: false, admin: true, error })
  },
  PostBannerAdd: async (req, res) => {
    console.log(req.body)
    const image = req.files.imagee1
    if (!image) {
      req.flash('errorz', 'File is not a image')
      res.redirect('/admin/add-banner')
    } else {
      let imageUrl = image[0].path

      imageUrl = imageUrl.substring(6)
      const banner = new Banner({
        title: req.body.title,
        image: imageUrl,
        url: req.body.url,
        description: req.body.description
      })
      banner.save((err, doc) => {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/admin/banner')
        }
      })
    }
  },
  banner: async (req, res) => {
    const Allban = await Banner.find()
    res.render('admin/banner', { uzer: false, admin: true, Allban })
  },
  deleteBanner: async (req, res) => {
    const id = req.query.id
    await Banner.findOneAndDelete({ _id: id })
    res.redirect('/admin/banner')
  },
  order: async (req, res) => {
    const result = []
    const addresslist = await Address.find()
    const orders = await Order.find().populate('user_Id')
    orders.forEach((el, i) => {
      addresslist.forEach((x) => {
        // eslint-disable-next-line eqeqeq
        const index = x.address.findIndex(obj => obj._id == el.address)
        if (index >= 0) {
          result.push(x.address[index])
        }
      })
    })

    res.render('admin/order', { uzer: false, admin: true, orders, result })
  },
  changeStatus: async (req, res) => {
    const status = req.query.s
    const orderId = req.query.id

    Order.findOneAndUpdate({ _id: orderId }, { $set: { orderStatus: status } }, { new: true }).then(async (order) => {
      if (order.orderStatus === 'cancelled') {
        const products = order.cart.items.map((el) => {
          const product = { productId: el.product_id, qty: el.qty }
          return product
        })
        for (let i = 0; i < products.length; i++) {
          await Products.findOneAndUpdate({ _id: products[i].productId }, { $inc: { stock: products[i].qty } })
        }
      }
      res.json({ status: true })
    })
  },
  coupons: async (req, res) => {
    const coupons = await Coupon.find()
    const c = { coup: '' }
    c.coup = coupons
    res.render('admin/coupons', { admin: true, uzer: false, c })
  },
  DeleteCoupon: async (req, res) => {
    const id = req.query.id
    await Coupon.findOneAndDelete({ _id: id })
    res.json({ status: true })
  },
  salesReport: async (req, res) => {
    const sales = await Order.aggregate([{
      $match: { orderStatus: { $eq: 'delivered' } }
    }, {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalPrice: { $sum: '$cart.totalPrice' },
        items: { $sum: { $size: '$cart.items' } },
        count: { $sum: 1 }
      }
    }, { $sort: { createdAt: -1 } }])

    res.render('admin/sales', { uzer: false, admin: true, sales })
  },
  monthSalesReport: async (req, res) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    const sales = await Order.aggregate([{
      $match: { orderStatus: { $eq: 'delivered' } }
    }, {
      $group: {
        _id: {

          month: { $month: '$createdAt' }

        },
        totalPrice: { $sum: '$cart.totalPrice' },
        items: { $sum: { $size: '$cart.items' } },
        count: { $sum: 1 }
      }
    }, { $sort: { createdAt: -1 } }])

    const salesRep = sales.map((el) => {
      const newOne = { ...el }
      newOne._id.month = months[newOne._id.month - 1]
      return newOne
    })

    res.render('admin/monthsales', { uzer: false, admin: true, salesRep })
  },
  yearSalesReport: async (req, res) => {
    const sales = await Order.aggregate([{
      $match: { orderStatus: { $eq: 'delivered' } }
    }, {
      $group: {
        _id: {
          year: { $year: '$createdAt' }
        },
        totalPrice: { $sum: '$cart.totalPrice' },
        items: { $sum: { $size: '$cart.items' } },
        count: { $sum: 1 }
      }
    }, { $sort: { createdAt: -1 } }])

    res.render('admin/yearsales', { uzer: false, admin: true, sales })
  },
  chart1: async (req, res) => {
    console.log('success')
    if (req.query.day) {
      const sales = await Order.aggregate([{
        $match: { orderStatus: { $eq: 'delivered' } }
      }, {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalPrice: { $sum: '$cart.totalPrice' },
          items: { $sum: { $size: '$cart.items' } },
          count: { $sum: 1 }
        }
      }, { $sort: { createdAt: -1 } }])

      res.json({ sales })
    } else if (req.query.year) {
      const sales = await Order.aggregate([{
        $match: { orderStatus: { $eq: 'delivered' } }
      }, {
        $group: {
          _id: {
            year: { $year: '$createdAt' }
          },
          totalPrice: { $sum: '$cart.totalPrice' },
          items: { $sum: { $size: '$cart.items' } },
          count: { $sum: 1 }
        }
      }, { $sort: { createdAt: -1 } }])
      console.log(sales, 'huhuuuuuuuuuuu')
      res.json({ sales })
    } else {
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
      const sales = await Order.aggregate([{
        $match: { orderStatus: { $eq: 'delivered' } }
      }, {
        $group: {
          _id: {

            month: { $month: '$createdAt' }

          },
          totalPrice: { $sum: '$cart.totalPrice' },
          items: { $sum: { $size: '$cart.items' } },
          count: { $sum: 1 }
        }
      }, { $sort: { createdAt: -1 } }])

      const salesRep = sales.map((el) => {
        const newOne = { ...el }
        newOne._id.month = months[newOne._id.month - 1]
        return newOne
      })

      res.json({ salesRep })
    }
  },
  monthlyRev: async (req, res) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    const sales = await Order.aggregate([{
      $match: { orderStatus: { $eq: 'delivered' } }
    }, {
      $group: {
        _id: {

          month: { $month: '$createdAt' }

        },
        totalPrice: { $sum: '$cart.totalPrice' },
        items: { $sum: { $size: '$cart.items' } },
        count: { $sum: 1 }
      }
    }, { $sort: { createdAt: -1 } }])

    const salesRep = sales.map((el) => {
      const newOne = { ...el }
      newOne._id.month = months[newOne._id.month - 1]
      return newOne
    })
    console.log(salesRep)
    res.json({ salesRep })
  }
}
