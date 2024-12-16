const mongoose = require('mongoose')

const brandSchema = new mongoose.Schema({
    brandName: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    brandImage: {
        type: [String],
        required: true
    },
    brandOffer:{
        type:Number,
        default:0
    },
    isBlocked : {
        type: Boolean,
        default: false

    },
    createdAt: {
        type: Date,
        default: Date.now
    }

},{timestamps: true})

module.exports = mongoose.model('Brand' , brandSchema)