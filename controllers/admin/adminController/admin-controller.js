const Admin = require ('../../../models/admin-model')
const User = require ('../../../models/user-model')
const bcrypt = require ('bcrypt')
const Order = require('../../../models/order-modal')
const OrderItem = require('../../../models/oredr-items-model')
const Product = require('../../../models/product-model')


const securePassword = require ('../../../utils/hashpassword')
const { OrderedBulkOperation } = require('mongodb')
const { format } = require('morgan')


// Admin log-in handler
exports.loadLogin = async (req, res, next)=>{
    try {
        if( req.session.admin){
            return res.redirect('/admin/dashboard')
        }
        return res.status(200).render('admin/login')
    } catch (error) {
        next(error)
    }
}

// Admin log-in verify Handler..!
exports.verifyLogin = async (req, res, next)=>{
    try {
        const { email, password} =req.body

        // Admin already exist
        const admin = await Admin.findOne({email : email})
        if( !admin ){
            return res.status(401).json({ message : "Invalid email or password"})
        }
        const passwordMatch = await bcrypt.compare(password, admin.password)
        if (!passwordMatch){
            return res.status(401).json({message: "Invalid email or password"})
        }
         // Set admin id in session
        req.session.admin = admin._id

        res.status(200).json({ message: "Login successful"})

    } catch (error) {
        next(error)
        
    }
}


exports.loadDashboard = async (req, res, next)=>{
    try {
        return res.status(200).render('admin/dashboard')
    } catch (error) {
        console.error('An error occured while loading dashboard',error);
        next(error)
        
    }
}

// Admin Dashboard Hanler..!
exports.loadDashboardData = async( req, res, next )=>{

    try {
        const {filter}= req.query; // week , month, year.
        const currentDate = new Date();

        let labels = [];
       

        let startDate;

        if(filter === 'week'){
            startDate = new Date(currentDate.setDate(currentDate.getDate() - 6)); // Last seven days.
           
        }else if(filter === 'month'){
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(),1); // start of the month!;
        }else if (filter === 'year'){
            startDate = new Date(currentDate.getFullYear(), 0, 1); // start of the year!
        } else {
            startDate = new Date(0)// Defualt to all time!
        }

        const endDate = new Date();

        //----- Chart Data Addregation-----

        const chartData = await Order.aggregate([
            {
                $match:{
                    createdAt: {$gte: startDate, $lte: endDate},
                },
            },
            {
                $group: {
                    // _id: {$dateToString: {format: '%Y-%m-%d', date: '$createdAt'}},
                    _id: filter === 'week' 
                    ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }} 
                    : filter === 'month' 
                    ? { $dateToString: { format: '%Y-%m', date: '$createdAt' }} 
                    : { $dateToString: { format: '%Y', date: '$createdAt' }},

                    deliveredOrders: {$sum:{$cond: [{ $eq:['$orderStatus', 'Delivered']}, 1, 0]}},
                    cancelledOrders: {$sum:{$cond:[{$eq:['$orderStatus', 'Cancelled']}, 1, 0]}},
                    totalDiscounts: {$sum: '$totalDiscount'},
                    totalRevenue: {$sum: '$totalAmount'},
                },
            },
            { $sort: {_id:1}},
        ]);

       
        //------ Summary Data Aggregation------

        const summary = await Order.aggregate([
            {
                $group: {
                    _id:null,
                    totalDeliveredOrders: {$sum: {$cond: [{$eq: ['$orderStatus', 'Delivered']}, 1, 0]}},
                    totalCancelledOrders: {$sum: {$cond:[{$eq:['$orderStatus', 'Cancelled']},1, 0]}},
                    totalDiscounts: {$sum: '$totalDiscount'},
                    totalRevanue: {$sum: '$totalAmount'},
                },
            },
        ]);

        //-------Top10 aggregations-------
        const topCategories = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'orders', 
                    localField: '_id', 
                    foreignField: 'orderItems', 
                    as: 'orderDetails',
                },
            },
            { $unwind: '$orderDetails' }, 
            {
                $match: {
                    'orderDetails.orderStatus': 'Delivered', 
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: '$productDetails.category', 
                    totalSales: { $sum: '$quantity' }, 
                },
            },
            { 
                $lookup: { 
                    from: 'categories', 
                    localField: '_id', 
                    foreignField: '_id',
                    as: 'categoryDetails',
                },
            },
            { $unwind: '$categoryDetails' }, 
            {
                $project: {
                    _id: 0, 
                    
                    _id: '$categoryDetails.name', // Get the name of the category
                    totalSales: 1, 
                },
            },
            { $sort: { totalSales: -1 } }, 
            { $limit: 10 }, 
        ]);
        


       // Top Brands

       const topBrands = await OrderItem.aggregate([
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'orderItems',
                as: 'orderDetails',
            },
        },
        { $unwind: '$orderDetails' }, 
        {
            $match: {
                'orderDetails.orderStatus': 'Delivered', 
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'productDetails',
            },
        },
        { $unwind: '$productDetails' }, 
        {
            $group: {
                _id: '$productDetails.brand', 
                totalSales: { $sum: '$quantity' }, 
            },
        },
        {
            $lookup: { 
                from: 'brands', 
                localField: '_id', 
                foreignField: '_id',
                as: 'brandDetails',
            },
        },
        { $unwind: '$brandDetails' }, 
        {
            $project: {
                _id: 0, 
                
                _id: '$brandDetails.brandName', 
                totalSales: 1, 
            },
        },
        { $sort: { totalSales: -1 } },
        { $limit: 10 }, 
    ]);
    


       // Top products

       const topProducts = await OrderItem.aggregate([
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'orderItems',
                as: 'orderDetails',
            },
        },
        { $unwind: '$orderDetails' },
        {
            $match: {
                'orderDetails.orderStatus': 'Delivered', // Filter only delivered orders
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: 'product',
                foreignField:'_id',
                as:'productDetails'
            },
        },
        { $unwind:'$productDetails' },
        {
            $group:{
                _id:'$productDetails.productName', 
                totalSales:{ $sum:'$quantity'}, 
            }
        },
        { $sort:{ totalSales:-1 }}, 
        { $limit : 10 } 
    ]);
    



        return res.status(200).json({
            chartData,
            labels,
            summary: summary[0] || {},
            topCategories,
            topBrands,
            topProducts,
        })
    } catch (error) {
        next(error)
        
    }
}

// Admin Logout Handler...!
exports.logout = async (req, res, next)=>{
    try {
        // session destroy
        req.session.destroy((err)=>{
            if (err){
             
              return  res.status(500).json({ message : "could not logout..!"})
            }
            // clear cookie
            res.clearCookie('connect.sid');
            res.status(200).json({ message: "Log out successfull..!"})
        })
       
        
    } catch (error) {
        next(error)
    }
}

