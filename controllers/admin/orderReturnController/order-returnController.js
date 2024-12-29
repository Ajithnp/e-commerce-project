const User = require('../../../models/user-model')
const Product = require('../../../models/product-model')
const Order = require ('../../../models/order-modal')
const Wishlist = require('../../../models/wishlist-model')
const Coupon = require('../../../models/coupon-model')
const Wallet = require('../../../models/wallet-model')
const AppliedCoupon = require('../../../models/couponApplied-model')
const ProductReturn = require('../../../models/orderProductReturn-model')


exports.getReturnRequest = async(req, res, next)=>{
    try {

        //Capturing the filter value
        const filterData = req.query.filter || '';

        const page = parseInt(req.query.page) || 1; 
        const limit = 5; 
        const skip = (page - 1) * limit;

        const filter = {};
        if(filterData && filterData !== 'All'){
            filter['returnProductStatus'] = filterData;
        }


        const productReturns = await ProductReturn.find(filter)
            .populate([
                { 
                    path: 'order', 
                    model: 'Order', 
                    select: '_id userId orderId', 
                    populate: { path: 'userId', model: 'User', select: 'name' } 
                },
                {
                     path: 'product',
                      model: 'Product',
                       select: 'productName '
                     },
            ]).sort({createdAt: -1})
              .skip(skip)
              .limit(limit)

              

              const totalOrders = await ProductReturn.countDocuments(filter);

              const totalPages = Math.ceil(totalOrders / limit);


            const filteredReturns = productReturns.map(request => {
                const { product, productColor } = request; // Get product and its color
                if (product && product.colorStock) {
                    // Filter colorStock to match the returned product's color
                    product.colorStock = product.colorStock.filter(stock => stock.color === productColor);
                }
                return request;
            });
            
                                     
       res.status(200).render('admin/order-product-return',{
        productReturns,
        currentPage:page,
        totalPages:totalPages,
        filterData

       })                              
    } catch (error) {
        console.error('An error occured while loading the order product return page', error)
        next(error)
        
    }
}

exports.orderRequestAccept = async(req, res, next)=>{
    const returnId = req.params.id;
   

    try {

        // find the return request..!
        const returnRequest = await ProductReturn.findByIdAndUpdate(returnId)
                .populate('product', 'saleprice colorStock')
                .populate('order', 'userId couponDiscount orderItems')
                .lean(); // reduce memory usage;


     
         if(!returnRequest){
            return res.status(404).json({message: 'Return request not found..!'})
         }       
       
         // Reasign stock..!
           await Product.updateOne(
            { _id: returnRequest.product._id, "colorStock.color": returnRequest.productColor }, 
             { $inc: { "colorStock.$.quantity": returnRequest.productQuantity } } 
            );

            // calculate the refund amount
            let basePrice = returnRequest.productSalePrice;
            let refundAmount;

            
            if(returnRequest.order.couponDiscount){
                let orderItemCount = returnRequest.order.orderItems.length;
                let couponDiscount = returnRequest.order.couponDiscount / orderItemCount;
                refundAmount = Math.max(basePrice - couponDiscount, 0);
                

            }else{
                refundAmount = basePrice;
            }
            
            await ProductReturn.findByIdAndUpdate(returnId,
                {productRefundAmount:refundAmount,
                 returnProductStatus:'Return Approved'   
                }
                
            );

            const orderId = returnRequest?.order?._id;
            
        
            if(orderId){
    
                // Find the order!
                const order = await Order.findById(orderId);
    
                const orderItems = order?.orderItems.length;
    
                // find the product return count!
    
                const returnedItemsCount = await ProductReturn.countDocuments({
                    order: orderId,
                    returnProductStatus: "Return Approved",
                });
                
    
                if(orderItems === returnedItemsCount){
                    await Order.findByIdAndUpdate(orderId, {orderStatus: "Full Order Returned"});
                }
                
            }
    

            // add money to wallet.
            const userId = returnRequest.order.userId;

            const wallet = await Wallet.findOneAndUpdate(
                { userId },
                { $inc: { walletBalance: refundAmount } },
                { new: true, upsert: true }
            )

            wallet.transactions = wallet.transactions || [];
            wallet.transactions.push({
            transactionType: 'credit',
            transactionAmount: refundAmount,
            transactionDescription: 'Order amount refunded',
            transactionId: `TXN-${Date.now()}`, 
        });

            await wallet.save();


            res.status(200).json({
                message: 'Return request approved, product stock updated, and wallet refunded.',
                refundAmount,
            });

        
    } catch (error) {
        console.error('An error occured while accepting the return request..!')
        next(error)
        
    }
}

// Order item return reject!
exports.orderRequestReject = async(req, res, next)=>{
    const returnId = req.params.id;
    const {reason} = req.body;

    try {

          // Update the return request 
          const returnRequest = await ProductReturn.findByIdAndUpdate(
            returnId,
            {
                returnProductStatus: 'returnRejected',
                rejectionReason: reason,
            },
            { new: true } // Return the updated document
        );

        if(!returnRequest){
            return res.status(404).json({message: 'Return request not found!'});
        }

        

        res.status(200).json({message: 'Return request has been rejected.'})
        
    } catch (error) {
        console.error('An error occured while rejecting return request',error);
        next(error)
    }
}

// Show order return request.
exports.viewOrderReturnRequest = async(req, res, next)=>{
    const returnId = req.params.id;
    try {
        // Find the request!
        const returnRequest = await ProductReturn.findById(returnId).populate([
           {
             path: 'order',
             select: '_id orderId',
             populate:{
                path: 'userId',
                select: 'name email phone'
             }
           },
           {
            path:'product',
            select: 'productName salePrice'
           }
        ])

        if(!returnRequest){
            return res.status(404).json({message:'request not found!'})
        }

        res.status(200).render('admin/product-return-view',{
            returnRequest
        })
    } catch (error) {
        console.error('An error occured while loading the product return request page!',error)
        next(error)
    }
}
