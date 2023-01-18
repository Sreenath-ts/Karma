/* eslint-disable eqeqeq */
const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  address: {
    type: [{
      name: {
        type: String
      },
      mob: {
        type: Number
      },
      house: {
        type: String
      },
      landmark: {
        type: String
      },
      city: {
        type: String
      },
      district: {
        type: String

      },
      state: {
        type: String

      },
      pincode: {
        type: Number

      },
      status: {
        type: Boolean,
        default: false
      }
    }]

  },
  userId: {
    type: String,
    ref: 'User'
  }
})

addressSchema.methods.editAdd = async function (data, id) {
  const add = this.address
  const Existing = await add.findIndex(obj => obj._id == id)
  add[Existing] = data
  return this.save()
}

addressSchema.methods.delete = async function (addId) {
  const add = this.address
  const Existing = await add.findIndex(obj => obj._id == addId)
  add.splice(Existing, 1)
  return this.save()
}
addressSchema.methods.finding = async function (addId) {
  const addresses = this.address
  const res = []
  for (let i = 0; i < addId.length; i++) {
    const index = await addresses.findIndex(obj => obj._id == addId[i])
    if (index >= 0) {
      res.push(addresses[index])
    }
  }
  return res
}
module.exports = mongoose.model('Address', addressSchema)
