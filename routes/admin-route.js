const express = require ('express')
const adminRoute = express.Router()

const adminController = require('../controllers/admin/adminController/admin-controller')
const userController = require('../controllers/admin/userController/user-controller')
const categoryController = require('../controllers/admin/categoryController/category-controller')
const brandController = require('../controllers/admin/brandController/brand-controller')
const productController = require('../controllers/admin/productController/product-controller')
const orderController = require('../controllers/admin/orderController/orderController')
const auth = require('../middleware/auth')

const multer = require('multer')
const storage = require('../helpers/multer')
const uploads = multer({storage: storage});

// Log-in
adminRoute.route('/login')
         .get(adminController.loadLogin)
         .post(adminController.verifyLogin)

// Dash board
adminRoute.route('/')
       .get(auth.adminAuth,adminController.loadDashboard)

//  logout
adminRoute.route('/logout')
        .get(adminController.logout)

// Get user

adminRoute.route('/users')
       .get(auth.adminAuth,userController.getUsers)

// Block user

adminRoute.route('/blockCustomer/:id')
       .post(auth.adminAuth,userController.blockUser)

// unblock user

adminRoute.route('/unblockCustomer/:id')
        .post(auth.adminAuth,userController.unblockUser)
 
        
// Category management
adminRoute.route('/category')
      .get(auth.adminAuth,categoryController.categoryInfo)     
      
// Add category

adminRoute.route('/addCategory')
         .get(auth.adminAuth,categoryController.addCategory)
         .post(auth.adminAuth,categoryController.addNewCategory)

// Edit category
adminRoute.route('/category/editCategory')
         .get(auth.adminAuth,categoryController.getEditCategoryPage)
         .post(auth.adminAuth,categoryController.editCategory)
         
//List category
adminRoute.route('/category/listCategory')
        .post(auth.adminAuth,categoryController.listCategory)        
        
// Unlist category
adminRoute.route('/category/unlistCategory')
       .post(auth.adminAuth,categoryController.unlistCategory)
 
// Offer category
adminRoute.route('/category/addOffer')
       .post(auth.adminAuth,categoryController.addOffer)       


// Brand management
adminRoute.route('/brands')
       .get(auth.adminAuth,brandController.getBrands)      
       
       
//Add
adminRoute.route('/brands/addBrand')
        .get(auth.adminAuth,brandController.getAddBrandPage)
        .post(uploads.single('image'),brandController.addNewBrand)

// Edit
adminRoute.route('/brands/editBrand')
        .get(auth.adminAuth,brandController.editBrandPage)
        .post(uploads.single('image'),brandController.editBrand)

// List
adminRoute.route('/brands/listBrand')
       .post(auth.adminAuth,brandController.listBrand)

//Unlist
adminRoute.route('/brands/unlistBrand')
      .post(brandController.unlistBrand)

// Product management...!
adminRoute.route('/products')
       .get(auth.adminAuth,productController.getProducts)

// Product detailed page
adminRoute.route('/products/details/:id')
         .get(auth.adminAuth,productController.getProductDetailes)


//Add
adminRoute.route('/products/addProduct')
       .get(auth.adminAuth,productController.addProductPage)
       .post(uploads.array('productImage',4), productController.addProduct);

//Edit
adminRoute.route('/products/editProduct/:id')
       .get(auth.adminAuth,productController.getProductEdit)
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


       // Order Management..!
adminRoute.route('/orders')
          .get(orderController.getOrders)

adminRoute.route('/orders/viewOrder/:id')    
          .get(orderController.viewOrder) 
          
// Order status manipulate..!
adminRoute.route('/orders/:id/status') 
          .patch(orderController.updateOrderStatus)         

module.exports = adminRoute;         