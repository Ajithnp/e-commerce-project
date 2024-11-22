const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    userId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items :[{

        productId :{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
        },
        quantity:{
            type: Number,
            default:0,
            max: 5
        },
        price:{
            type: Number,
            required: true
        },
        totalPrice:{
            type:Number,
            required: true
        },
        // status:{
        //     type: String,
        //     enum:['In stock', 'Out of stock'],
        //     default: 'In stock'
        // },
        selectedColor :{
            type: String,
            enum: ['white', 'black', 'blue'],
            required: true
        }
    }],
    subTotal:{
        type: Number,
        default: 0

    }
},{timestamps:true});


module.exports = mongoose.model ('Cart',cartSchema)