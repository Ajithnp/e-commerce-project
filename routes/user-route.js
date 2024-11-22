const express  = require('express')
const userRoute = express.Router()
const userController = require('../controllers/user/userController/userContoller')
const passport = require ('passport')
const storeController = require('../controllers/user/userStoreController/store-controller')
const wishlistController = require('../controllers/user/userWishlistController/wishlistController')
const cartController = require('../controllers/user/cart-controller/cartController')
const userProfileController = require('../controllers/user/user-profile-controller/user-profile-controller')

const auth = require('../middleware/auth')


// Langin-page
userRoute.route('/')
       .get(auth.userAuth,userController.getLandingPage)

// Log-in
userRoute.route('/user/login')
       .get(userController.loadLogin) 
       .post(userController.verifyLogin)


// Sign-up
userRoute.route('/user/signup')
         .post(userController.userRegistration)         


//OTP
userRoute.route('/user/otp')
          .get(userController.getOtpPage)
          .post(userController.verifyOtp)

userRoute.route('/user/resendOtp')
         .post(userController.resendOtp)  


// User google sign route
userRoute.route('/auth/google')
         .get(passport.authenticate('google',{scope:['profile', 'email']}));
  // Sign success snd failure response
  
 userRoute.route('/auth/google/callback')
        .get(passport.authenticate('google', { failureRedirect: '/user/login'}),
        (req, res)=> {
              // if(req.user && req.user.message) {
              //        return res.status(400).json({code:'EMAIL_ALREADY_REGISTERED', message: 'Email already registered. please use your password to log in.'})
              // }
                //success login
                // store user info: in session
                req.session.user = {
                       name: req.user.name,
                       id: req.user._id
                }
                             res.redirect('/')
        }
   ); 
         


      
// User Log-out        
userRoute.route('/user/logout')
        .post(userController.userLogout)     


//User -Store
userRoute.route('/user/store')
          .get(auth.userAuth,storeController.getStorePage)  
          

// Product detail page          
userRoute.route('/beats/product/productDetails/:id')   
         .get(auth.userAuth,storeController.getProductDetail)       


// Wish list ..!
userRoute.route('/beats/wishlist')
       .get(auth.userAuth, wishlistController.getWishlist)

// Cart..!
userRoute.route('/beats/cart')
         .get(auth.userAuth,cartController.getUserCart)

// Add to cart..!
userRoute.route('/beats/user/cart/add')
         .post(cartController.addToCart) 
         

userRoute.route('/beats/user/cart/remove/:id')
         .delete(cartController.removeCartItem)         









         
// User Profile..!
userRoute.route('/beats/userProfile')
       .get(userProfileController.getUserProfile)

       
// User Account info edit..!
userRoute.route('/beats/userProfileUpdate')
         .post(userProfileController.userProfileEdit)  

     
// User Address Add new Adress..!
userRoute.route('/beats/user/addAddress')
         .post(userProfileController.addNewAddress)


// User address acess..!
userRoute.route('/beats/user/getAddress/:id')
          .get(userProfileController.getAddress)


// User address Edit
userRoute.route('/beats/user/editAddress/:id')
         .put(userProfileController.editAddress)



// User address delete..!
userRoute.route('/beats/user/deleteAddress/:id')
         .delete(userProfileController.deleteAddress)








// About...!
userRoute.route('/beats/about')
         .get(userController.aboutPage)    

// Contact...!
userRoute.route('/beats/contact')
       .get(userController.contactPage)


// User forgot Password Handler..!
userRoute.route('/beats/user/forgotPassword')
         .get(userController.forgotPassword)
         .post(userController.verifyEmail) 

         // User forgot Password OTP ..!  
// resend OTP  
userRoute.route('/beats/user/forgotPassword/resendOtp')
         .post(userController.forgotResendOtp)        

       
userRoute.route('/beats/user/forgotPassword/otpVerify')
         .get(userController.forgotVerifyOtpPage)         
         
module.exports = userRoute