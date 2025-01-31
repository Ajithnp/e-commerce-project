const Product = require('../../../models/product-model')
const Category = require('../../../models/category-model')
const Brand =require('../../../models/brand-model')
const Order = require('../../../models/order-modal')


exports.getOrders = async (req, res, next)=>{

   

    try {

        const page = parseInt(req.query.page) || 1; 
        const limit = 10; 
        const skip = (page - 1) * limit;

        // capturing the search query
        let searchQuery = req.query.search || '';

        const filter = {};
        if(searchQuery){
            filter['orderId'] = {$regex: new RegExp(searchQuery, 'i')};
        }


        const orders = await Order.find({...filter,paymentStatus:{$ne:'Failed'}})
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product', 
                    select: 'productName' 
                }
            })
            .populate('userId', 'name')
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit);


            const totalOrders = await Order.countDocuments(filter);

            const totalPages = Math.ceil(totalOrders / limit);

            res.status(200).render('admin/order-management', {
                orders,
                currentPage: page,
                totalPages:totalPages,
                searchQuery
            });
        
    } catch (error) {
        console.error('An error occured while loading order page..', error);
        next(error)
        
    }

}

// View Order details..(Get)

exports.viewOrder = async (req, res, next)=>{
    const orderId = req.params.id;

    try {
        
        
        const order = await Order.findById(orderId)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product', 
                    select: 'productName productImage regularPrice' 
                }
            })
            .populate('userId', 'name email')
            

        if(!order){
            return res.status(400).json({message : 'Order not found..!'})
        }

        res.status(200).render('admin/order-datails', {
            order
        });
        
    } catch (error) {
        console.error('An error occured while loading the order details page..!')
        next(error)
    
        
    }
}

// Order status change handler.
exports.updateOrderStatus = async (req, res, next) => {
    const orderId = req.params.id;
    const { status } = req.body;

    try {
        const order = await Order.findById(orderId).populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                select: 'colorStock' 
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found!' });
        }

        // Check if status is being changed to 'Cancelled'
        if (status == 'Cancelled') {
            // Restore product quantities
            for (const item of order.orderItems) {
                const product = item.product

                if (product) {
                    const selectedColorStock = product.colorStock.find(color => color.color === item.color);

                    if (selectedColorStock) {
                        selectedColorStock.quantity += item.quantity; // Restore quantity
                        selectedColorStock.status = selectedColorStock.quantity > 0 ? 'In stock' : 'Out of stock';
                    }
                }
            }
        }

        if(status == 'Delivered'){
            order.paymentStatus = 'Completed';
        }

        // Update order status
        order.orderStatus = status;
        
        // Save updated product quantities
        await Promise.all(order.orderItems.map(async item => {
            const product = item.product; 
            await product.save(); 
        }));

        // Save updated order status
        await order.save();

        res.status(200).json({ message: 'Order status updated successfully!' });
        
    } catch (error) {
        console.error('Error updating order status:', error);
        next(error);
    }
};