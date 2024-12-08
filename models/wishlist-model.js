const mongoose = require('mongoose')
const { schema } = require('./cart-model')

const wishlistSchema = new mongoose.Schema({

    userId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },

    products: [{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
       
        createdOn:{
            type: Date,
            default: Date.now
        }

    }]
},{timestamps: true})

module.exports = mongoose.model('Wishlist', wishlistSchema)