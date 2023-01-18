const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
  code: {
    type: String,
    require: true,
    unique: true
  },
  Available: {
    type: Number
  },
  Status: {
    type: String,
    default: 'Active'
  },
  amount: {
    type: Number,
    required: true
  },
  expireAfter: {
    type: Date
  },
  usageLimit: {
    type: Number
  },
  minCartAmount: {
    type: Number
  },
  maxDiscountAmount: {
    type: Number
  },
  userUsed: [
    {
      userId: {
        type: String,
        ref: 'user'
      }
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('Coupon', couponSchema)
