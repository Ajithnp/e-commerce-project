const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
    quantity:{
        type: Number,
        required: true
    },
    color:{
        type: String,
        required: true
    },
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',

    },
    price:{
        type: Number,

    },
    totalPrice:{
        type: Number
    }
})

module.exports = mongoose.model('OrderItem',orderItemSchema)