const user = require('../models/user')
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay')

const instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret
})
module.exports = {
  dologin: (userLog) => {
    return new Promise(async (resolve, reject) => {
      const response = {}

      const userz = await user.findOne({ email: userLog.email })

      if (userz && userz.access) {
        bcrypt.compare(userLog.password, userz.password).then((stat) => {
          if (stat) {
            response.user = userz
            response.status = true
            resolve(response)
            console.log('login success')
          } else {
            resolve({ status: false })
            console.log('password wrong')
          }
        })
      } else {
        resolve({ status: false })
        console.log('no user')
      }
    })
  },
  generateOrder: (order) => {
    return new Promise((resolve, reject) => {
      const orderId = order._id
      const total = order.products[0].totalPrice
      console.log(orderId, total)
      instance.orders.create({
        amount: total * 100,
        currency: 'INR',
        receipt: '' + orderId,
        notes: {
          key1: 'value3',
          key2: 'value2'
        }
      }).then((response) => {
        console.log(response + 'backennnnnddd')
        resolve(response)
      }).catch((e) => console.log(e))
    })
  },
  paymentVerify: (detials) => {
    return new Promise((resolve, reject) => {
      let crypto
      try {
        crypto = require('node:crypto')
      } catch (err) {
        console.error('crypto support is disabled!')
      }
      const secret = process.env.key_secret
      const hmac = crypto.createHmac('sha256', secret)
        .update(detials.payment.razorpay_order_id + '|' + detials.payment.razorpay_payment_id)
        .digest('hex')
      if (hmac == detials.payment.razorpay_signature) {
        resolve()
      } else {
        const err = 'payment failure'
        reject(err)
      }
    })
  }
}
