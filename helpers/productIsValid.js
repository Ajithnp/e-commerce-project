const Product = require('../models/product-model')

async function isProductValid(productId) {
    try {
  
        const product = await Product.findById(productId).populate('brand category');

        if (!product || product.isBlocked || product.brand.isBlocked || product.category.isListed) {
            return false; 
        }
        return true; 
    } catch (error) {
        console.error('Error validating product:', error);
        return false; 
    }
}

module.exports = isProductValid;