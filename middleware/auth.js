const Admin = require('../models/admin-model')
const User = require ('../models/user-model')


exports.adminAuth = async (req, res, next)=>{
    try {
        if (! req.session.admin ){
            
            
            return res.redirect('/api/v1/admin/login')
            
        }
        // Find admin by id 
        const admin = await Admin.findById(req.session.admin.id)
        if (req.session.admin){
        
            
            return next()
        }else{
            return res.redirect('/api/v1/admin/login')
        }
        
    } catch (error) {
        next(error)
        
    }
}


// For user
exports.userAuth = async (req, res, next )=>{
    try{
       
        
        // check if user authenticated..!
        if( !req.session.user){
            return res.redirect('/user/login'); // Redirect if not authenticated..!
        }
        //Find user by ID...!
        const user = await User.findById(req.session.user.id);
       
        

        // Check if user exists and not blocked..!
        if (user && !user.isBlocked) {
            return next() // Proceed to next ...!
        }else {
            res.redirect('/user/login')  // Redirect if user is blocked or not found..!
        }
    }
    catch(error) {
                console.log('Error in user Authentication',error.message);
                res.status(500).send('Internal server error')
                
            }
};



// Middleware for checking authentication
exports.isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.json({ isAuthenticated: true });
    }
    return res.json({ isAuthenticated: false });
};