const mongoose = require('mongoose');


const usedCouponSchema = new mongoose.Schema({
    couponId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Coupon', 
      required: true 
    }, // Reference to the Coupon used
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }, // User who used the coupon
    redeemedAt: { 
      type: Date, 
      default: Date.now 
    }, // When the coupon was redeemed
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order', 
      required: true 
    }, // Order for which the coupon was used
  }, { timestamps: true });
  
  module.exports = mongoose.model('UsedCoupon', usedCouponSchema);
  