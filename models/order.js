const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
  user_Id: {
    type: String,
    ref: 'user',
    required: true
  },
  address: {
    type: String,
    ref: 'Address',
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  paymentMethod: String,
  orderStatus: String,
  date: {
    type: Date,
    required: true
  }
},
{ timestamps: true }
)

module.exports = mongoose.model('order', orderSchema)
