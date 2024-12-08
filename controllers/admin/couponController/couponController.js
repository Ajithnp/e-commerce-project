const Coupon = require('../../../models/coupon-model')
const mongoose = require('mongoose')





exports.showCoupons = async (req, res, next)=>{
    try {

        // Get all coupons..!
        const coupons = await Coupon.find({}).sort({createdAt:-1})
        
        res.status(200).render('admin/coupn-management',{
            coupons,
        });
    } catch (error) {
        console.error('An error occured while loading the coupon page..!')
        next(error)
        
    }
}

// Coupon add get controller..!
exports.getAddCoupon = async(req, res, next)=>{
    try {
        res.status(200).render('admin/add-coupon')
    } catch (error) {
        console.error('An error occured while loading the add-coupon page..!', error);
        next(error)
        
    }
}

exports.addCoupon = async (req, res, next)=>{
    try {

        const {code, description, discountType, minDiscountValue, maxDiscountValue,expiryDate,usageLimit,conditions, minimumPurchaseAmount} = req.body.couponData;

        // check if the coupon code already exist..!
        const existCode = await Coupon.findOne({code})

        if(existCode){
            return res.status(409).json({message:'Coupon code already exists..!'})
        }

        const newCoupon = new Coupon({
            code,
            description,
            discountType,
            minDiscountValue,
            maxDiscountValue,
            expiryDate,
            usageLimit,
            conditions,
            minPurchaseAmount:minimumPurchaseAmount
        })

        await newCoupon.save()
        res.status(201).json({message: 'Coupon added successfully..!'});
    } catch (error) {
        console.error('An error occured while adding new coupon');
        next(error);
        
    }
}

// Coupon edit get Handler..!
exports.getEditForm = async (req, res, next)=>{
    const couponId = req.params.id;
    try {
        // find coupon details
        const coupon = await Coupon.findById(couponId)

        if(!coupon){
            return res.status(404).json({message: 'Coupon not fount'});
        }

        res.status(200).render('admin/edit-coupon',{
            coupon,
        })
        
    } catch (error) {
        console.error('An error occured while loading the edit coupon form..!',error);
        next(error)
        
    }
}

// Coupon Edit post handler..!

exports.updateCoupon = async (req, res ,next)=>{
    const couponId = req.params.id;


    console.log('font-end datas',req.body);

    let {
        code,
        description,
        discountType,
        minDiscountValue,
        maxDiscountValue,
        expiryDate,
        usageLimit,
        conditions,
        minimumPurchaseAmount
    } = req.body.couponData;

    try {
        const existCouponCode = await Coupon.findOne({ code, _id: { $ne: couponId } });

        console.log('Existing coupon with same code:', existCouponCode);

        if(existCouponCode){
            return res.status(400).json({message: 'Coupon code is already exists..!'});
        }
        if(!minimumPurchaseAmount){
            minimumPurchaseAmount = 0;
        }


        const updateCoupon = await Coupon.findByIdAndUpdate(couponId,{
            code,
            description,
            discountType,
            minDiscountValue,
            maxDiscountValue,
            expiryDate,
            usageLimit,
            conditions,
            minPurchaseAmount:Number(minimumPurchaseAmount)
        },{new:true})

        console.log('updated coupon', updateCoupon);
        

        if(!updateCoupon){
            return res.status(404).json({message:'Coupon not fount..!'})
        }

        res.status(200).json({message: 'coupon updated Successfull..!'})
        
    } catch (error) {
        console.error('An error occured while updating coupon..!');
        next(error);
    }
}

// Coupon List Patch handler..!
exports.listCoupon = async (req, res, next)=>{
    const couponId = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(couponId)) {
            return res.status(400).json({ message: 'Invalid coupon ID' });
        }

        const updateCoupon = await Coupon.findByIdAndUpdate(couponId,
            {isActive: true},
            {new: true}
        );

        if(!updateCoupon){
            return res.status(404).json({message: 'Coupon not found..!'});
        }

        res.status(200).json({message: 'Coupon Listed successfully..!'})

        
    } catch (error) {
        console.error('An error occured while listing coupon..!',error)
        next(error);
        
    }
}



// Coupon Unlist patch Handler..!
exports.unlistCoupon = async (req, res, next)=>{
    const couponId = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(couponId)) {
            return res.status(400).json({ message: 'Invalid coupon ID' });
        }

        const updateCoupon = await Coupon.findByIdAndUpdate(couponId,
            {isActive: false},
            {new: true}
        );

        if(!updateCoupon){
            return res.status(404).json({message: 'Coupon not found..!'});
        }

        res.status(200).json({message: 'Coupon Unlisted successfully..!'})

        
    } catch (error) {
        console.error('An error occured while listing coupon..!',error)
        next(error);
        
    }
}



// Coupon Delete Handler..!

exports.deleteCoupon = async (req, res, next)=>{
    const couponId = req.params.id;

    try {
        // Delete coupon
        if (!mongoose.Types.ObjectId.isValid(couponId)) {
            return res.status(400).json({ message: 'Invalid coupon ID' });
        }
        const coupon = await Coupon.findById(couponId);

        if(!coupon){
            return res.status(400).json({message: 'Coupon not found'})
        }
            await Coupon.deleteOne({_id: couponId})

            res.status(200).json({message: 'Coupon deleted successfully..!'})
        
        
    } catch (error) {
        console.error('An error occured while deleting coupon..!',error)
        next(error)
        
    }
}