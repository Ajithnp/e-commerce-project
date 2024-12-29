const mongoose = require('mongoose')

const User = require ('../../../models/user-model')

// get users
exports.getUsers = async (req, res, next)=>{
    try {

        // Capturing searchValue
        const searchQuery = req.query.search ? req.query.search.trim().toLowerCase() : '';

        //Pagination
        const page = req.query.page*1 || 1;
        const limit = req.query.limit*1 || 4
        const skip = (page -1) * limit

        const filter = {};
        if(searchQuery){
            filter['name'] = {$regex: `^${searchQuery}`, $options: 'i'};
        }
       


        const totalUsers = await User.countDocuments(filter)
        const users = await User.find(filter).sort({createdAt:-1}).skip(skip).limit(limit).exec()
       

        // render
        res.render('admin/users',{
            users,
            page,
            totalUsers,
            totalPage: Math.ceil(totalUsers/limit),
            searchQuery
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