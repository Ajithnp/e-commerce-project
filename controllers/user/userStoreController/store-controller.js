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

        // Sort Options
        let sortOptions = {};

        const sortBy = req.query.sortBy;

        switch (sortBy) {
            case 'priceLowToHigh':
                sortOptions.salePrice = 1;
                break;
            case 'priceHighToLow':
                sortOptions.salePrice =-1;
                break;
            case 'featured':
                sortOptions.isFeatured = -1;
                break;
            case 'newArrivals':
                sortOptions.createdAt = -1;
                break;
            case 'alphabeticalAtoZ':
                sortOptions.productName = 1;
                break;
            case 'alphabeticalZtoA':
                sortOptions.productName = -1;
                break;
            default:
                break;                        
        }
        const findname = req.query.q;
        // let  productData 
        // if(findname){
        //    productData = await Product.find({productName:{ $regex:'.*'+findname+'.*'} });

        // } else{

        // const brandFilter = req.query.brand ? req.query.brand : null
        // const brandDoc = await Brand.findOne({ brandName: brandFilter });

        const brandFilter = req.query.brand ? req.query.brand : null;

        // If a brand filter is provided, find the corresponding brand ID
        let brandIdFilter = null;
        if (brandFilter) {
            const brandDoc = await Brand.findOne({ brandName: brandFilter });
            if (brandDoc) {
                brandIdFilter = brandDoc._id; // Get ObjectId of the found brand
                console.log('brand id ',brandFilter);
                
            }
        }
        console.log('Category found in store page ', brandFilter);
        

           let productData = await Product.find(
            {isBlocked: false,
                category:{$in:categories.map(category=>category._id)},
                // ...(categoryFilter && { category: categoryFilter }),
                brand:{$in: brands.map(brand=>brand._id)},
                ...(brandIdFilter && { brand: brandIdFilter }),
                colorStock: { $elemMatch: {quantity: { $gt: 0}}}
            }
        ).sort(sortOptions).skip(skip).limit(limit).exec();
    
        const userDate = user ? await User.findById(user.id) : null;
        console.log('userdata or null', userDate);
        

        return res.status(200).render('user/store-page',{
            user: userDate,
            products: productData,
            page,
            totalPages,
            brands
        });

    } catch (error) {
        console.error('Error occured while loading store page',error)
        next(error)
        
    }
}

// Product Detail Page Handler....!
exports.getProductDetail = async (req, res, next)=>{
    const {id} = req.params;
   
    try {
        const user = req.session.user;
        // Check product is exists..?
        const product = await Product.findById(id).populate('category');
        
        

        if(!product || product.isBlocked){
            // return res.status(404).render('404');
            return res.redirect('/user/store')

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

// Product search using name..!
// exports.productSearch = async(req,res, next)=>{

//         try {
//             const findname = req.params.name;
//             const objs = await Product.find({productName:{ $regex:'.*'+findname+'.*'} });
//             // res.json(objs);
//             return res.status(200).render('user/store-page',{
//                 products:objs

//             })
//         } catch (error) {
//             res.json({message: error});        
//         }
        
// }