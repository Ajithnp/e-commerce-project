const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId:{
        type: String,
    },
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
        enum:['Processing','Delivered','Cancelled','Shipped','Failed'],
        default:'Processing',
        required: true

    },
    paymentMethod:{
        type: String,
        enum: ['COD','Card payment','Wallet','razorpay','Bank Transfer','Paypal'],
        required: true
    },
    subTotal:{
        type:Number
    },
    totalDiscount:{
        type: Number
    },
    couponDiscount:{
        type:Number
    },

    savings:{
        type:Number
    },

    totalAmount:{
        type: Number,  
    },
    paymentStatus: 
    { type: String,
     enum: ['Pending', 'Completed', 'Failed'],
     default: 'Pending'
     },

    appliedCouponCode:{
        type: String, 
        required: false,
    },
    cancelReason:{
        type: String,
        required :false
    }

},{timestamps:true});

orderSchema.virtual('id').get(function (){
    return this._id.toHexString();
});

orderSchema.set('toJSON',{
    virtuals: true,
});

module.exports = mongoose.model('Order',orderSchema);