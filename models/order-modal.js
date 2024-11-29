const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems : [{
        type: mongoose.Schema.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    shippingAddress1:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    zip :{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    orderStatus:{
        type: String,
        enum:['Pending','Delivered','Cancelled','Shipped','Dispatch'],
        default:'Pending',
        required: true

    },
    paymentMethod:{
        type: String,
        enum: ['COD','Card payment','Wallet','UPI','Bank Transfer','Paypal'],
        required: true
    },
    totalAmount:{
        type: Number,
        
    }

},{timestamps:true});

orderSchema.virtual('id').get(function (){
    return this._id.toHexString();
});

orderSchema.set('toJSON',{
    virtuals: true,
});

module.exports = mongoose.model('Order',orderSchema);