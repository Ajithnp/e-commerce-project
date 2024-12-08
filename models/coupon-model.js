const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true 
    },
    description:{
        type:String,
        required: true
    },

    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    minDiscountValue: {
        type: Number,
        required: true,
        min: 0 
    },
    maxDiscountValue: {
        type: Number,
        required: true,
        min: 0 
    },
    expiryDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: 1 // Limit the number of times this coupon can be used
    },
    usedCount: {
        type: Number,
        default: 0 // Track how many times the coupon has been used
    },
    isActive: {
        type: Boolean,
        default: true,
    },
      isCouponApplied: {
        type: Boolean,
        default: false
    },
    conditions: {
        type: String,
        enum: ['minimum_purchase', 'first_purchase', 'no_condition'],
        required: true
    },
    minPurchaseAmount:{
        type: Number,
        default:0
    }

},{timestamps:true})


module.exports = mongoose.model('Coupon', couponSchema)