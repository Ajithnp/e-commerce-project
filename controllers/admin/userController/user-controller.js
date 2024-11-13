const mongoose = require('mongoose')

const User = require ('../../../models/user-model')

// get users
exports.getUsers = async (req, res, next)=>{
    try {

        //Pagination
        const page = req.query.page*1 || 1;
        const limit = req.query.limit*1 || 4
        const skip = (page -1) * limit
        // query = query.skip(skip).limit(limit);

        const totalUsers = await User.countDocuments()
        const users = await User.find().skip(skip).limit(limit).exec()
       

        // render
        res.render('admin/users',{
            users,
            page,
            totalPage: Math.ceil(totalUsers/limit)
        })
      
    } catch (error) {
        next(error)
    }
}

// Block user handler
exports.blockUser = async (req, res, next)=>{
    const userId = req.params.id;
   
    console.log('useris',userId);
    
  
    try {
        await User.findByIdAndUpdate(userId, { isBlocked: true}); // Block

        res.json({message: "user blocked successfull"})
    } catch (error) {
        console.error(error)
        next(error)
        
    }
}

// Unblock user
exports.unblockUser = async (req, res, next)=>{
    const userId = req.params.id;
 
    try {
        await User.findByIdAndUpdate(userId, { isBlocked: false})
       res.json({message : "user unblock succesfull"})
        
    } catch (error) {
        console.error(error)
        next(error)
        
    }
}