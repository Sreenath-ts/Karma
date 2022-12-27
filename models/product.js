const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number
  },
  category: {
    type: String,
    ref: 'category',
    require: [true, 'One categorry needed']
  },
  image: {
    type: Array,
    required: true
  },
  description: {
    type: String,
    max: 100
  },
  discount: String,
  size: String
})

module.exports = mongoose.model('products', productSchema)
