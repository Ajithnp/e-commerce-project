const Product = require('../../../models/product-model')
const Brand = require('../../../models/brand-model')
const Category = require('../../../models/category-model')
const User = require('../../../models/user-model')



exports.getStorePage = async (req, res, next) => {
    try {
        // Pagination setup
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        // Fetch total products and calculate total pages
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        const user = req.session.user;
        const userData = user ? await User.findById(user.id) : null;

        // Fetch categories and brands concurrently
        const [categories, brands] = await Promise.all([
            Category.find({ isListed: false }), // Fetch only listed categories
            Brand.find({ isBlocked: false })
        ]);

        // Build filter criteria
        const filters = {
            isBlocked: false,
            colorStock: { $elemMatch: { quantity: { $gt: 0 } } }
        };

        // Handle brand filtering
        if (req.query.brand) {
            const selectedBrands = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];
            const brandIds = await Promise.all(selectedBrands.map(async (brandName) => {
                const brandDoc = await Brand.findOne({ brandName });
                return brandDoc ? brandDoc._id : null; // Return ObjectId or null if not found
            }));
            filters.brand = { $in: brandIds.filter(id => id !== null) }; // Filter out null values
        }

        // Handle category filtering
        if (req.query.category) {
            console.log('filter category', req.query.category);
            
            const selectedCategories = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
            const categoryIds = await Promise.all(selectedCategories.map(async (categoryName) => {
                const categoryDoc = await Category.findOne({ name: categoryName });
                console.log('category found', categoryDoc);
                
                return categoryDoc ? categoryDoc._id : null; // Return ObjectId or null if not found
            }));
            filters.category = { $in: categoryIds.filter(id => id !== null) }; // Filter out null values
        }

        // Handle price range filtering
        if (req.query.priceLow && req.query.priceHigh) {
            filters.salePrice = { $gte: Number(req.query.priceLow), $lte: Number(req.query.priceHigh) };
        }

        // Handle search query for product name, category name, and brand name
        if (req.query.q) {
            filters.$or = [
                { productName: { $regex: new RegExp(req.query.q, 'i') } }, // Search by product name
                { 'category.name': { $regex: new RegExp(req.query.q, 'i') } }, // Search by category name
                { 'brand.brandName': { $regex: new RegExp(req.query.q, 'i') } } // Search by brand name
            ];
        }

        // Fetch products with applied filters, sorting, and pagination
        const productData = await Product.find(filters)
            .sort(getSortOptions(req.query.sortBy))
            .skip(skip)
            .limit(limit)
            .exec();

        return res.status(200).render('user/store-page', {
            user: userData,
            products: productData,
            page,
            totalPages,
            brands,
            categories
        });
    } catch (error) {
        console.error('Error occurred while loading store page', error);
        next(error);
    }
};

function getSortOptions(sortBy) {
    switch (sortBy) {
        case 'priceLowToHigh':
            return { salePrice: 1 };
        case 'priceHighToLow':
            return { salePrice: -1 };
        case 'featured':
            return { isFeatured: -1 };
        case 'newArrivals':
            return { createdAt: -1 };
        case 'alphabeticalAtoZ':
            return { productName: 1 };
        case 'alphabeticalZtoA':
            return { productName: -1 };
        default:
            return {}; // Default to no sorting
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

