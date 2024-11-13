const Brand = require ('../../../models/brand-model')

exports.getBrands = async (req, res, next)=>{
    try {
              //Pagination
              const page = req.query.page*1 || 1;
              const limit = req.query.limit*1 || 4
              const skip = (page -1) * limit
              // query = query.skip(skip).limit(limit);
      
              const totalBrands = await Brand.countDocuments()
              const brand = await Brand.find().skip(skip).limit(limit).exec()
             
      
              // render
              res.status(200).render('admin/brands',{
                  brand,
                  page,
                  totalPage: Math.ceil(totalBrands/limit)
              })
    } catch (error) {
        console.error(error)
        next(error)
    }
}

// ADD brand page
exports.getAddBrandPage = async (req, res, next)=>{
    try {
        return res.status(200).render('admin/add-brand')
    } catch (error) {
        console.error(error)
        next(error)
    }
}

//ADD new brand
exports.addNewBrand = async (req, res, next)=>{
    const { name , description } = req.body
    
     if (!req.file ){
        return res.status(400).json({message: 'Please upload a logo image'});
     }

     const logo = req.file.filename  // Get the file path from Multer;
    
    try {
        // Brand exists
        const brand = await Brand.findOne({
            brandName: name
            })

        
        if (brand){
            return res.status(400).json({message: 'Brand name already exists'});
        }
        const newBrand = new Brand({ brandName: name, description, brandImage: logo});
        await newBrand.save()

        res.status(201).json({ message: 'New brand added successfull..!'})
        
    } catch (error) {
        console.error(error)
        next(error)
        
    }
}

//edit brand

exports.editBrandPage = async (req, res, next)=>{
    const { id }= req.query;
    try {
        const brand = await Brand.findById(id)
        res.status(201).render('admin/edit-brand',{
            brand
        })
        
    } catch (error) {
        console.error;
        next(error)
        
    }
}

// Edit brand post handler
exports.editBrand = async (req, res, next )=>{
    // const { id }=req.query;
  
    const { id, name, description}= req.body;
    console.log('id from query', id);

    let logo;
    if ( req.file){
        logo= req.file.filename // get the file path from multer!
    }
    try {
        //brand exixts
        const existingBrand = await Brand.findById(id);

        if(! existingBrand) {
            return res.status(404).json({ message: "Brand not found..!"})
        }
        // check if another brand with the same name exists
        const duplicateBrand = await Brand.findOne({ brandName:name, _id: {$ne: id}});

        if(duplicateBrand) {
            return res.status(400).json({ message: "Brand name already exists..!"})
        }

        //Update brand details..!
        existingBrand.brandName = name;
        existingBrand.description = description

        if(logo) {  // If a new logo was uploaded, updated it
            existingBrand.brandImage =logo;

        }
        await existingBrand.save()
        res.status(200).json({ message :"Brand updated successfully..!"})
        
    } catch (error) {
        console.error(error)
        next(error)
        
    }
}


// List brand handler

exports.listBrand = async (req, res, next)=>{
    const { id} = req.query
    try {
        const brand = await Brand.findById(id)
        if(! brand ){
            return res.status(401).json({message : " Brand not found..!"})
        }
        await Brand.updateOne({_id: id},{$set: {isBlocked:true}})
        res.status(201).json({message: "Brand Listed"})
    } catch (error) {
        console.error(error)
        next(error)
        
    }
}

// Unlist Brand handler

exports.unlistBrand = async (req, res, next)=>{

    const { id }= req.query;
    try {

        const brand = await Brand.findById(id)
        if (!brand ) {
            return res.status(401).json({ message: "Brand not found..!"})
        }
        await Brand.updateOne({_id: id},{$set:{isBlocked: false}})
        res.status(201).json({message: "Brand Unlisted"})
        
    } catch (error) {
        console.error(error)
        next(error)
        
    }
}