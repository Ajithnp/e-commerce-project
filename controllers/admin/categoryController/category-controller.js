const Category = require('../../../models/category-model')
const Product = require('../../../models/product-model')


// Category Info handler

exports.categoryInfo = async (req, res, next)=>{
    try {
           //Pagination
           const page = req.query.page*1 || 1;
           const limit = req.query.limit*1 || 4
           const skip = (page -1) * limit
           // query = query.skip(skip).limit(limit);
   
           const totalCategories = await Category.countDocuments()
           const category = await Category.find().skip(skip).limit(limit).exec()
          
   
           // render
           res.render('admin/get-category',{
               category,
               page,
               totalPage: Math.ceil(totalCategories/limit)
           })
        
    } catch (error) {
        next(error)
        
    }
}

// Add category handler

exports.addCategory = async (req, res, next)=>{
    try {
        return res.status(200).render('admin/add-category')
        
    } catch (error) {
        next(error)
    }
}

// Category post handler

exports.addNewCategory = async (req, res, next)=>{
    const { name , description } = req.body  
    try {
        // Cat: exist or not..!
        const existCat = await Category.findOne({name})
        if (existCat){
            return res.status(400).json({ message: 'Category already exist..!'})
        }
        // Save category..!
        const newCategory = new Category ({ name , description})
        await newCategory.save()
        return res.status(201).json({ message: 'New category added..!'}) 
        
    } catch (error) {
        next(error)
        
    }
}

// Category edit handler
exports.getEditCategoryPage = async(req,res, next)=>{
    const { id }= req.query
    try {

        const category = await Category.findOne({_id: id})
        return res.status(200).render('admin/edit-category',{
            category
        })
        
    } catch (error) {
        next(error) 
    }
}
// Category edit post handler
exports.editCategory = async (req, res, next)=>{
    const { id }= req.body
    const { name, description }=req.body
    try {
        const updateCategory = await Category.findByIdAndUpdate(id, {
            name,
            description
        },{new : true}) // return the updated document

        if(!updateCategory){
          return  res.status(404).json({message: 'Updation failed..! Category not found'})
        }
        res.status(200).json({message: 'Category update successfull..!'})

        
    } catch (error) {
        console.error(error);
        next(error)
        
    }
}

// category list handler
exports.listCategory = async (req, res, next)=>{
    const { id } = req.query
    try {
        await Category.findByIdAndUpdate(id, {isListed: true});
        res.status(201).json({message: "Category listed successfully..! "});
        
    } catch (error) {
        next(error)
        
    }
}

//Unlist category
exports.unlistCategory = async (req, res, next)=>{
    const { id }= req.query
    try {
        await Category.findByIdAndUpdate(id, {isListed: false});
        res.status(201).json({message: "Category unlisted successfully..!"})
        
    } catch (error) {
        next(error)
        
    }
}

//  Add offer category
exports.addOffer = async (req, res, next)=>{
    const { id}= req.query
    const {percentage} = req.body
    // const percentage = parseInt(req.body.percentage)

    // validate the percentage
    if (! percentage || isNaN(percentage) || percentage <0 || percentage >=100){
        return res.status(400).json({ message: 'Please enter a valid percentage between 1 and 100'});
    }
    try {
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({message: 'Category not found..!'})
        }
        //Check existing product offer
        const products = await Product.find({category : id})
        const hasHigherOffer = products.some(product => product.productOffer > percentage);
        if(hasHigherOffer) {
            return res.status(400).json({message: 'The category offer canot be grater than existing product offers.'});
        }
        category.categoryOffer = percentage
        await category.save()
        res.status(200).json({message: 'Offer added successfully..!' })

    } catch (error) {
        next(error)
        
    }
}










