const Product = require('../../../models/product-model')
const Brand = require('../../../models/brand-model')
const Category = require('../../../models/category-model')
const User = require('../../../models/user-model')


 
exports.getStorePage = async (req, res, next)=>{

    try {

        // Pagination
        const page = req.query.page*1 || 1;
        const limit = req.query.limit*1 || 9;
        const skip = (page-1) * limit;

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts/limit)

        const user = req.session.user;

        const [categories, brands] = await Promise.all ([
            Category.find({ isListed: false }),
            Brand.find({ isBlocked: false })
        ]);

        let productData = await Product.find(
            {isBlocked: false,
                category:{$in:categories.map(category=>category._id)},
                brand:{$in: brands.map(brand=>brand._id)},
                colorStock: { $elemMatch: {quantity: { $gt: 0}}}
            }
        ).skip(skip).limit(limit).exec();
        
        const userDate = user ? await User.findById(user.id) : null;
        console.log('userdata or null', userDate);
        

        return res.status(200).render('user/store-page',{
            user: userDate,
            products: productData,
            page,
            totalPages,
        });

    } catch (error) {
        console.error('Error occured while loading store page',error)
        next(error)
        
    }
}

// Product Detail Page Handler....!
exports.getProductDetail = async (req, res, next)=>{
    const {id} = req.params;
    console.log('product id fetched', id);
    

    try {
        const user = req.session.user;
        // Check product is exists..?
        const product = await Product.findById(id);

        if(!product){
            return res.status(404).render('404');
        }
       
        const userDate = user ? await User.findById(user.id) : null;
        console.log('userdata or null', userDate);
        
        

        const relatedProducts = await Product.find({category: product.category}).limit(5);

        res.status(200).render('user/product-detail-page',{product, relatedProducts:relatedProducts,user:userDate});
    } catch (error) {
        console.error('Error while loading product detail page', error);
        next(error);
        
    }
}