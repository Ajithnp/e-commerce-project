const express = require ('express')
const adminRoute = express.Router()

const adminController = require('../controllers/admin/adminController/admin-controller')
const userController = require('../controllers/admin/userController/user-controller')
const categoryController = require('../controllers/admin/categoryController/category-controller')
const brandController = require('../controllers/admin/brandController/brand-controller')
const productController = require('../controllers/admin/productController/product-controller')
const {adminAuth, requestData} = require('../middleware/auth')

const multer = require('multer')
const storage = require('../helpers/multer')
const uploads = multer({storage: storage});

// Log-in
adminRoute.route('/login')
         .get(adminController.loadLogin)
         .post(adminController.verifyLogin)

// Dash board
adminRoute.route('/')
       .get(adminAuth,adminController.loadDashboard)

//  logout
adminRoute.route('/logout')
        .get(adminController.logout)

// Get user

adminRoute.route('/users')
       .get(adminAuth,userController.getUsers)

// Block user

adminRoute.route('/blockCustomer/:id')
       .post(userController.blockUser)

// unblock user

adminRoute.route('/unblockCustomer/:id')
        .post(userController.unblockUser)
 
        
// Category management
adminRoute.route('/category')
      .get(categoryController.categoryInfo)     
      
// Add category

adminRoute.route('/addCategory')
         .get(categoryController.addCategory)
         .post(categoryController.addNewCategory)

// Edit category
adminRoute.route('/category/editCategory')
         .get(categoryController.getEditCategoryPage)
         .post(categoryController.editCategory)
         
//List category
adminRoute.route('/category/listCategory')
        .post(categoryController.listCategory)        
        
// Unlist category
adminRoute.route('/category/unlistCategory')
       .post(categoryController.unlistCategory)
 
// Offer category
adminRoute.route('/category/addOffer')
       .post(categoryController.addOffer)       


// Brand management
adminRoute.route('/brands')
       .get(brandController.getBrands)      
       
       
//Add
adminRoute.route('/brands/addBrand')
        .get(brandController.getAddBrandPage)
        .post(uploads.single('image'),brandController.addNewBrand)

// Edit
adminRoute.route('/brands/editBrand')
        .get(brandController.editBrandPage)
        .post(uploads.single('image'),brandController.editBrand)

// List
adminRoute.route('/brands/listBrand')
       .post(brandController.listBrand)

//Unlist
adminRoute.route('/brands/unlistBrand')
      .post(brandController.unlistBrand)

// Product management...!
adminRoute.route('/products')
       .get(productController.getProducts)

// Product detailed page
adminRoute.route('/products/details/:id')
         .get(productController.getProductDetailes)


//Add
adminRoute.route('/products/addProduct')
       .get(productController.addProductPage)
       .post(uploads.array('productImage',4), productController.addProduct);

//Edit
adminRoute.route('/products/editProduct/:id')
       .get(productController.getProductEdit)
adminRoute.route('/products/editProduct/:id')
       .post(uploads.array('productImage',4),productController.editProduct)   
       
       
// list
adminRoute.route('/products/listProduct')
          .post(productController.listProduct)

//Unlist
adminRoute.route('/products/unlistProduct')
           .post(productController.unlistProduct)

adminRoute.route('/products/deleteImage')
           .post(productController.deleteSingleProductImage)




module.exports = adminRoute;         