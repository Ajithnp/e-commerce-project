const Coupon = require('../../../models/coupon-model')
const AppliedCoupon = require('../../../models/couponApplied-model')
const Order = require('../../../models/order-modal')


exports.couponApply = async (req, res,next)=>{
    const {couponCode, subTotal, userId}= req.body;

    try {
        // Find coupon using code..!
        const coupon = await Coupon.findOne({code: couponCode});

        console.log('coupon found:', coupon);
        

        if(!coupon){
            return res.status(404).json({message: 'Coupon is Invalid..!'})
        }


        // check the coupon already used..!
        const isCouponUsed = await AppliedCoupon.findOne({ 
            couponId:coupon._id, userId 
        });
           if (isCouponUsed) {
          return res.status(400).json({message: 'Coupon already used..!'})
        }

        // Check if the coupon is expired or inactive
        if (new Date() > coupon.expiryDate || !coupon.isActive) {
             return res.status(400).json({ message: 'Coupon is expired or inactive' });
        }

        // Checking the conditions..!
        if(coupon.conditions === 'minimum_purchase'){
            if(subTotal < coupon.minPurchaseAmount){
                return res.status(400).json({message: `This coupon requires a minimum purchase of Rs.${coupon.minPurchaseAmount}`});
            }
        } else if(coupon.conditions === 'first_purchase'){
            const hasPreviousOrder = await Order.findOne({userId})
            if(hasPreviousOrder){
                res.status(400).json({message: 'This coupon is only applicable for first-time purchase..!'})
            }
        }else if(coupon.conditions === 'no_condition'){

        }else{
            res.status(400).json({message : 'Unknown coupon condition..!'})
        }

        // one more condition usage limit
       

         // Calculate discount amount based on type
         let discountAmount;
         if(coupon.discountType === 'percentage'){
            discountAmount = (coupon.minDiscountValue / 100) * subTotal;

            discountAmount = Math.min(discountAmount, coupon.maxDiscountValue);
         } else { // fixed discount type
            discountAmount = Math.min(coupon.minDiscountValue, coupon.maxDiscountValue);
        }

        res.status(200).json({
            message: 'Coupon applied successfully!',
            discountAmount,
            couponId:coupon._id,
            codeOfCoupon:coupon.code
        });

        // save the coupon discount amount in session.
        

        
    } catch (error) {
        console.error('An errror occured while applying coupon',error)
        next(error)
        
    }
}


// Coupon remove Handler

exports.removeCoupon = async (req, res, next)=>{
    try { 

        
        res.status(200).json({ message: 'Coupon removed successfully!' });
        
    } catch (error) {
        console.error('Error removing coupon:', error);
        next(error)
        
    }
}