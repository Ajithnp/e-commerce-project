const dotenv = require('dotenv').config()
const Razorpay = require('razorpay')
const crypto = require('crypto')

const User = require('../../../models/user-model')
const Product = require('../../../models/product-model')
const Cart = require('../../../models/cart-model')
const Address = require('../../../models/user-address')
const OrderItem = require('../../../models/oredr-items-model')
const Order = require ('../../../models/order-modal')
const Wishlist = require('../../../models/wishlist-model')
const Coupon = require('../../../models/coupon-model')
const AppliedCoupon = require('../../../models/couponApplied-model')
const generateOrderId = require('../../../utils/gererateOrderId')
const isProductValid = require('../../../helpers/productIsValid')
const  Wallet = require('../../../models/wallet-model')
const Brand = require('../../../models/brand-model')
const Category = require('../../../models/category-model')

// const userAddress = require('../../../models/user-address')

exports.getUserCart = async (req, res, next)=>{

    const userId = req.session.user.id;

    try {
        // Finding User details..!
        const userData = await User.findById(userId);
        // check if the user has cart..?
        const cart = await Cart.findOne({userId}).populate('items.productId')

        if(cart){
            const validItems = [];
            for (const item of cart.items) {
                const isValid = await isProductValid(item.productId._id); 
                if (isValid) {
                    validItems.push(item); 
                }
            }
            cart.items = validItems;
        }

        // count cart documents..!
        const cartCount = await Cart.countDocuments()
   
        
        return res.status(200).render('user/cart',{cart,user:userData,cartCount})
    } catch (error) {
       console.error('Error occured while loading cart page', error)
       next(error) 
    }
}

// Add to cart handler..!

exports.addToCart = async (req, res, next) => {
    const { productId, color, quantity } = req.body;
    const flag = req.body?.flag;
    const userId = req.session.user.id;


    try {
        // Check if the user already has a cart
        let cart = await Cart.findOne({ userId })

        // If no cart exists, create a new one
        if (!cart) {
            cart = new Cart({ userId });
        }

        // Check if the product is already in the cart with the same color
        let existingItem = cart.items.find(item => 
            item.productId.toString() === productId && item.selectedColor === color
        );

    

        // Fetch product details
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found..!' });
        }

        // Find the color stock for the specific selected color
        const colorStock = product.colorStock.find(stock => stock.color === color);

        if (!colorStock) {
            return res.status(404).json({ message: 'Color stock not found..!' });
        }

        // Check  the requested quantity exceeds available stock
        if (quantity > colorStock.quantity) {
            return res.status(400).json({ message: 'Product is out of stock' });
        }

        if (existingItem) {
            // If the item already exists in the cart, show a message instead of updating
            return res.status(400).json({ message: 'This item is already in your cart.' });
        } else {
            // Create a new item object since it doesn't exist in the cart
            const newItem = {
                productId,
                quantity,
                price: product.salePrice,
                actualPrice:product.regularPrice,
                totalPrice: product.salePrice * quantity,
                selectedColor: color
            };
            // Add new item to the cart's items array
            cart.items.push(newItem);
        }

        // Calculate subtotal for the cart
        cart.subTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        // Save updated cart
        await cart.save();


        // remove item from wishlist

        if(flag){
             await Wishlist.findOneAndUpdate(
                {userId},
                {$pull : {products: {productId :productId}}},
                {new:true}
            )
        }

      
        
        return res.status(200).json(cart); // Return updated cart as response

    } catch (error) {
        console.error('An error occurred while adding new item to cart', error);
        next(error);
    }
};

// Remove Cart item Handler..!

exports.removeCartItem = async(req, res, next)=>{
    const userId = req.session.user.id;
    const {id}= req.params;

    try {
        let cart = await Cart.findOne({userId})

        if(!cart){
            return res.status(400).json({message: 'User not found..!'})
        }

        // Item remove..!
        cart.items = cart.items.filter(item => item._id.toString() !== id)

        // Re calculate subtotal..!
        cart.subTotal = cart.items.reduce((acc, item)=> acc+item.totalPrice,0)

        // Save Updated cart..!
        await cart.save();

        return res.status(200).json({message: 'Item removed from cart..!'})

        
    } catch (error) {
        console.error('An error occured while removing item from cart..!')
        next(error)
        
    }
}

// Cart quantity updation handler..!
exports.cartQuantityUpdate = async(req, res, next)=>{
    const userId = req.session.user.id;
    const {id} = req.params;
    const {quantity} = req.body; // Get new quantity from request body.


    try {
        const cart = await Cart.findOne({userId}).populate('items.productId');
        

        if(!cart){
            return res.status(404).json({message:'Cart not found..!'})
        }

        const existingItem = cart.items.find(item=> item._id.toString() == id);
        

        if(!existingItem){
            return res.status(404).json({message: 'Item not fount in cart'});
        }

        // Fetch the product details to check available quantity
        const product = await Product.findById(existingItem.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found..!' });
        }

         // Find the color stock for the specific selected color
        const colorStock = product.colorStock.find(stock => stock.color === existingItem.selectedColor);

        if (!colorStock) {
            return res.status(404).json({ message: 'Color stock not found..!' });
        }


        // Check if requested quantity exceeds available stock
        if (quantity > colorStock.quantity) {
          return res.status(400).json({ message: 'Product quantity exceeds available stock.' });
        }

        // Update item quantity and total price..!
        existingItem.quantity = quantity;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;

        //Recalculate sub total..!
        cart.subTotal = cart.items.reduce((acc, item)=> acc+item.totalPrice,0);

        // save
        await cart.save()
        return res.status(200).json(cart); // return updated cart as response..!

    } catch (error) {
        console.error('An error occured while updating cart item',error);
        next(error)
        
    }
}

// CheckoutPage...!
exports.getCheckoutPage = async (req, res, next) => {
    const userId = req.session.user.id;
    try {
        const [userData, address, cart, coupons] = await Promise.all([
            User.findById(userId),
            Address.find({ user: userId }),
            Cart.findOne({ userId }).populate('items.productId'),
            Coupon.find({ isActive: true }).sort({createdAt:-1})
        ]);

       
        

        // user wallet.
        const wallet = await Wallet.findOne({userId})
        if(wallet){
            var walletAmount = wallet.walletBalance || 0;
        }
        
        
        


        let totalSavings = 0;
        let totalAmount = 0; 
        const validCartItems = []; 
        
        

        // Validate products in the cart
        for (const item of cart.items) {
            const product = await Product.findById(item.productId).populate('brand category');

            // Check if product is blocked or if its brand or category is blocked
            if (!product.isBlocked && !product.brand.isBlocked && !product.category.isListed) {
                validCartItems.push(item); // Add valid item to the list


                // Calculate savings for valid products
                const savingsPerItem = (product.regularPrice - product.salePrice) * item.quantity;
                totalSavings += Math.max(savingsPerItem, 0);

                // Calculate total amount for valid products
                totalAmount += product.salePrice * item.quantity; // Use sale price for total calculation


                // Check color stock quantities
                const selectedColorStock = product.colorStock.find(color => color.color === item.selectedColor);
                if (selectedColorStock && selectedColorStock.quantity <= 0) {
                    // If stock is not available, skip this item
                    continue; 
                }
            }
        }
        
        

        //  cart with only valid items
        cart.items = validCartItems;

        //  available coupons
        const usedCoupons = await AppliedCoupon.find({ userId }).select('couponId');
        const usedCouponIds = usedCoupons.map(uc => uc.couponId.toString());

        const availableCoupons = coupons.filter(coupon => {
            const isExpired = new Date(coupon.expiryDate) < new Date();
            const isUsageLimitReached = coupon.usedCount >= coupon.usageLimit;
            const isAlreadyUsed = usedCouponIds.includes(coupon._id.toString());
            return !isExpired && !isUsageLimitReached && !isAlreadyUsed;
        });

        // Render the checkout page with updated totals
        res.status(200).render('user/checkout', {
            user: userData,
            userAddress: address,
            cart,
            totalSavings,
            totalAmount,
            coupons: availableCoupons,
            walletAmount,
            cartItems: JSON.stringify(cart.items)
        });
    } catch (error) {
        next(error);
    }
};


exports.orderItemsCheck = async (req, res, next) => {
    try {
        const { orderItems } = req.body;

        // Fetch product details from the database
        const products = await Product.find({ _id: { $in: orderItems.map(item => item.product) } }).populate('brand', 'category');



        // Check if any product, category, or brand is blocked
        const blockedItems = products.filter(product =>
            product.isBlocked || product.category.isListed || product.brand.isBlocked
        );

        if (blockedItems.length > 0) {
            return res.status(400).json({
                message: "Some products are blocked in this order, go to cart and continue again."
            });
        }

        res.status(200).json({ message: "All items are valid." });
    } catch (error) {
        console.error("Error checking order items:", error);
       next(error)
    }
};


// Checkout post handler (order confirm)
exports.orderConfirm = async (req, res, next)=>{
   
    
    const {userId, orderItems, address, paymentMethod,subTotal,savings,grandTotalValue,couponDiscount,couponId,couponCode} = req.body;
    

    try {

        let paymentStatus = 'Pending';


        if(paymentMethod === 'Wallet'){

            // find user wallet;
            const wallet = await Wallet.findOne({userId});

            if(!wallet || wallet.walletBalance < grandTotalValue){
                return res.status(400).json({message: 'Insufficient wallet balance!'})
            }

            wallet.walletBalance -= grandTotalValue;

            wallet.transactions.push({
                transactionType: 'debit',
                transactionAmount: grandTotalValue,
                transactionId: `TXN-${Date.now()}`,
                transactionDescription: 'Order amount deducted'
            });
        
            await wallet.save();
            paymentStatus = 'Completed';
        }
        // Address fetching...!
        const addressDetails = await Address.findById(address)

        if(!addressDetails){
            return res.status(400).json({message :'Invalid address provided..!'});
        }

        // Creating order-items and storing ID"s
        const createOrderitems = await OrderItem.insertMany(orderItems.map(item=>({
            quantity: item.quantity,
            color : item.color,
            product : item.product,
            price : item.price,
            totalPrice : item.totalPrice
        })));

        // Create Order with the created Order Items' IDs
        const createOrder = new Order ({
            userId,
            orderId:generateOrderId(),
            orderItems : createOrderitems.map(item=> item._id),
            shippingAddress1: addressDetails.streetAddress,
            city:addressDetails.city,
            zip: addressDetails.zip,
            country: addressDetails.country,
            phone: addressDetails.altPhone,
            orderStatus : 'Processing',
            paymentMethod,
            paymentStatus,
            subTotal,
            savings,
            couponDiscount:Number(couponDiscount),
            totalDiscount:Number(couponDiscount+savings),
            totalAmount:grandTotalValue,
            appliedCouponCode:couponCode
            

           
        })

        await createOrder.save();

        // Update product quantity..!
        for(item of orderItems){
            const product = await Product.findById(item.product);

            const selectedColorStock = product.colorStock.find(color=> color.color == item.color);


            if(selectedColorStock){
               let newQuantity = selectedColorStock.quantity - item.quantity;

              selectedColorStock.quantity = newQuantity
                if(selectedColorStock.quantity <= 0){
                    selectedColorStock.quantity = 0;
                    selectedColorStock.status = 'Out of stock';
                }
                await product.save();
            }

        }

        // delete user cart..!
        await Cart.findOneAndDelete({userId})

        // increment coupon Usedcount..!

        if(couponId){
            await Coupon.findByIdAndUpdate(couponId,
                {$inc: {usedCount:1}},
                {new: true}
            )
        }

        // save applliedcouponSchema..!

        if (couponId) {
            const usedCoupon = new AppliedCoupon({
                couponId: couponId,
                userId: userId,
                orderId: createOrder._id // Use the orderId from the saved order
            });
        
            await usedCoupon.save(); // Save the applied coupon
        }


        res.status(201).json({
            message: 'Order placed successfully!',
            orderId: createOrder._id 
        });
    
    } catch (error) {
        next(error);
    }
};



exports.razorPayOrderSave = async (req, res, next)=>{

    const { pendingOrderId } = req.body;

   

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, orderItems, address, paymentMethod,subTotal, savings, grandTotalValue,couponDiscount,couponCode,couponId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
           return res.status(400).json({ error: 'Missing required fields for signature validation.' });
       }
       const secretKey = process.env.RAZOR_PAY_SECRET_KEY;

    // do a validation
    
    const generatedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

 
    if (generatedSignature !== razorpaySignature) {
           return res.status(400).send('Invalid signature');
       }

      

       try {

        // for retry order!
        if(pendingOrderId){
            
            const existingOrder = await Order.findOneAndUpdate(
                {_id: pendingOrderId},
                {$set: {orderStatus:'Processing', paymentStatus:'Completed'}},
                {new: true}
            );


            if (!existingOrder) {
                return res.status(404).json({ message: 'Order not found!' });
            }

                // Clear the user's cart
                 await Cart.findOneAndDelete({ userId });

                 return res.json({ status: 'ok', message: 'Retry payment successful!', order: existingOrder });
        }else {

           const addressDetails = await Address.findById(address)

        if(!addressDetails){
         return res.status(400).json({message :'Invalid address provided..!'});
        }


        const createOrderitems = await OrderItem.insertMany(orderItems.map(item=>({
           quantity: item.quantity,
           color : item.color,
           product : item.product,
           price : item.price,
           totalPrice : item.totalPrice
       })));
           
           const createOrder = new Order({
               userId, 
               orderId: generateOrderId(),
               orderItems : createOrderitems.map(item=> item._id),
               shippingAddress1: addressDetails.streetAddress,
               city:addressDetails.city,
               zip: addressDetails.zip,
               country: addressDetails.country,
               phone: addressDetails.altPhone,
               orderStatus : 'Processing',
                paymentMethod,
                paymentStatus:'Completed',
                subTotal,
                savings,
                 couponDiscount:Number(couponDiscount),
                totalDiscount:Number(couponDiscount+savings),
               totalAmount:grandTotalValue,
                appliedCouponCode:couponCode
           });
   
           await createOrder.save();

           // Update product quantity..!
     for(item of orderItems){
           const product = await Product.findById(item.product);

           const selectedColorStock = product.colorStock.find(color=> color.color == item.color);


           if(selectedColorStock){
              let newQuantity = selectedColorStock.quantity - item.quantity;

             selectedColorStock.quantity = newQuantity
               if(selectedColorStock.quantity <= 0){
                   selectedColorStock.quantity = 0;
                   selectedColorStock.status = 'Out of stock';
               }
               await product.save();
           }

       }

        // delete user cart..!
     await Cart.findOneAndDelete({userId})


     if(couponId){
           await Coupon.findByIdAndUpdate(couponId,
               {$inc: {usedCount:1}},
               {new: true}
           )
       }

       if (couponId) {
           const usedCoupon = new AppliedCoupon({
               couponId: couponId,
               userId: userId,
               orderId: createOrder._id // Use the orderId from the saved order
           });
       
           await usedCoupon.save(); // Save the applied coupon
       }


         return res.json({ status: 'ok', message: 'Order saved successfully!' });
        }
       } catch (err) {
           console.error('Error saving order:', err);
           next(err)
           
       }
 
}


// Show Order success page..!

exports.razorPayfailedOrderSave = async (req, res, next) =>{
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, orderItems, address, paymentMethod,subTotal, savings, grandTotalValue,couponDiscount,couponCode,couponId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
           return res.status(400).json({ error: 'Missing required fields for signature validation.' });
       }
       const secretKey = process.env.RAZOR_PAY_SECRET_KEY;

       const generatedSignature = crypto
       .createHmac('sha256', secretKey)
       .update(`${razorpayOrderId}|${razorpayPaymentId}`)
       .digest('hex');

       try {

        
        const addressDetails = await Address.findById(address)

        if(!addressDetails){
         return res.status(400).json({message :'Invalid address provided..!'});
        }

        const createOrderitems = await OrderItem.insertMany(orderItems.map(item=>({
            quantity: item.quantity,
            color : item.color,
            product : item.product,
            price : item.price,
            totalPrice : item.totalPrice
        })));


        const failedOrder = new Order({
            userId, 
            orderId: generateOrderId(),
            orderItems : createOrderitems.map(item=> item._id),
            shippingAddress1: addressDetails.streetAddress,
            city:addressDetails.city,
            zip: addressDetails.zip,
            country: addressDetails.country,
            phone: addressDetails.altPhone,
            orderStatus : 'Failed',
             paymentMethod,
             paymentStatus:'Failed',
             subTotal,
             savings,
              couponDiscount:Number(couponDiscount),
             totalDiscount:Number(couponDiscount+savings),
            totalAmount:grandTotalValue,
             appliedCouponCode:couponCode
        });

        await failedOrder.save();


                // Update product quantity..!
     for(item of orderItems){
        const product = await Product.findById(item.product);
 
        const selectedColorStock = product.colorStock.find(color=> color.color == item.color);

    

        if(selectedColorStock){
           let newQuantity = selectedColorStock.quantity - item.quantity;
          
           

          selectedColorStock.quantity = newQuantity
            if(selectedColorStock.quantity <= 0){
                selectedColorStock.quantity = 0;
                selectedColorStock.status = 'Out of stock';
            }
            await product.save();
        }

    }

    if(couponId){
        await Coupon.findByIdAndUpdate(couponId,
            {$inc: {usedCount:1}},
            {new: true}
        )
    }

    if (couponId) {
        const usedCoupon = new AppliedCoupon({
            couponId: couponId,
            userId: userId,
            orderId: createOrder._id // Use the orderId from the saved order
        });
    
        await usedCoupon.save(); // Save the applied coupon
    }


    return res.json({status: 'ok', message: 'Order saved successfull' });

       } catch (error) {
        console.error('An error occured while saving failed order!')
        next(error)
       }
}

exports.orderSuccessPage = async (req, res, next)=>{
    const {orderId} = req.query;

    const userId = req.session.user.id;

    try {
        const user = await User.findById(userId);
        return res.status(200).render('user/order-successfully',{user,orderId})
    } catch (error) {
        console.error('An error occured while loading the order success page..!',error);
        next(error)
        
    }
}