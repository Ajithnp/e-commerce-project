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
        actualPrice:{
            type:Number
        },
        totalPrice:{
            type:Number,
            required: true
        },
      
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