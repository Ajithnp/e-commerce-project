const Product = require('../../../models/product-model')
const Category = require('../../../models/category-model')
const Brand =require('../../../models/brand-model')


// function for calculating highest offer!

const calculateFinalOffer = async (product) => {
    const highestOffer = Math.max(
        product.productOffer || 0,
        product.categoryOffer || 0,
        product.brandOffer || 0
    );
    product.finalOffer = highestOffer;
    product.salePrice = product.regularPrice - Math.round(product.regularPrice * (highestOffer / 100));
    await product.save();
};


exports.addOffer = async (req, res, next)=>{
    
    
    const {productId, offerPercentage} = req.body;


    if (!productId || offerPercentage >= 100 || offerPercentage < 1) {
        return res.status(400).json({ success: false, message: 'Invalid product ID or percentage!' });
    }


    try {
        // find product!
        const product = await Product.findById(productId)

        if(!product){
            return res.status(404).json({success: false, message:'Product not found!'});
        }

         // Update product offer
         product.productOffer = Number(offerPercentage);

        await calculateFinalOffer(product)

        res.status(200).json({success:true, message:'Product offer Updated successfully..!'});
    } catch (error) {
        console.error('An error occured while adding product offer!',error);
        next(error);
    }
}

// Product category offer!

exports.addCategoryOffer = async (req, res, next)=>{
    
    const {percentage,categoryId} = req.body

    // validate the percentage
    if (! percentage || isNaN(percentage) || percentage <0 || percentage >=100){
        return res.status(400).json({ message: 'Please enter a valid percentage between 1 and 100'});
    }
    try {
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({message: 'Category not found..!'})
        }

        // Find all products under the category!

        const products = await Product.find({category:categoryId});

        await Promise.all(
            products.map(async (product) => {
                product.categoryOffer = percentage;
                await calculateFinalOffer(product);
            })
        );
        
        category.categoryOffer = percentage
        await category.save()

        res.status(200).json({message: ' Category Offer added successfully..!' })

    } catch (error) {
        console.error('An error occured while adding category offer!')
        next(error)
        
    }
}

// Product Brand offer!
exports.addBrandOffer = async (req,res, next)=>{
    const {brandId, percentage} = req.body;

   

    if (! percentage || isNaN(percentage) || percentage <0 || percentage >=100){
        return res.status(400).json({ message: 'Please enter a valid percentage between 1 and 100'});
    }

    try {
        const brand = await Brand.findById(brandId);

        if(!brand){
            return res.status(404).json({message: 'Brand not found!'});
        }

        // Find all products under the brand.!
        const products = await Product.find({brand:brandId});

     
        

        await Promise.all(
            products.map(async (product) => {
                product.brandOffer = percentage;
                await calculateFinalOffer(product);
            })
        );

        brand.brandOffer = percentage;
        await brand.save();

        res.status(200).json({message: ' Brand Offer added successfully..!' })

    } catch (error) {
        console.error('An error occured while adding brand offer!',error);
        next(error);
        
    }

}