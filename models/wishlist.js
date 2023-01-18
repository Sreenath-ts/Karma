const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'user'
  },
  products: [
    {
      product: {
        type: String,
        ref: 'products'
      }
    }
  ]
})

module.exports = mongoose.model('Wishlist', wishlistSchema)
