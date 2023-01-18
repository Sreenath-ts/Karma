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
  cart: {
    items: [{
      product_id: {
        type: String,
        ref: 'products'
      },
      qty: {
        type: Number
      }
    }
    ],
    totalPrice: Number
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
