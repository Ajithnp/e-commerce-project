const Product = require('../../../models/product-model')
const Category = require('../../../models/category-model')
const Brand =require('../../../models/brand-model')

const fs = require('fs')
const path = require('path')

const sharp = require('sharp')


exports.getProducts = async (req, res, next)=>{

    try {
           //Pagination
           const page = req.query.page*1 || 1;
           const limit = req.query.limit*1 || 8
           const skip = (page -1) * limit
           
           // capturing seach value;
           const searchQuery = req.query.search ? req.query.search.trim().toLowerCase() : '';

           const filter = {};
           if(searchQuery){
            filter['productName'] = {$regex: `^${searchQuery}`, $options:'i'}
           }
   
        const totalProducts = await Product.countDocuments(filter);
        const productData = await Product.find(filter).skip(skip).limit(limit).exec()
        return res.status(200).render('admin/product-list',{
            data: productData,
            page,
            totalPage: Math.ceil(totalProducts/limit),
            searchQuery
        })

    } catch (error) {
        console.error('Error occured while loading product page', error)
        next(error)
        
    }
}

// Product detailed page Handler
exports.getProductDetailes = async (req, res, next)=>{
    const productId = req.params.id

    try {
        const product = await Product.findById(productId)
        .populate('brand', 'brandName')
        .populate('category', 'name')

        if(!product) {
            return res.status(404).render(404)
        }
        return res.status(200).render('admin/product-details',{product})
    } catch (error) {
        console.error('Error loading while product detail page', error);
        next(error)
        
    }
}





// Add product page get Handler
exports.addProductPage = async (req, res, next)=>{
    try {
        const category = await Category.find({isListed: false});
        const brand = await Brand.find({isBlocked: false})
        return res.status(200).render('admin/add-product',{
            cat: category,
            brand,
        })
        
    } catch (error) {
        console.error('Error occured while loading add Product page',error)
        next(error)
        
    }
}

// Product add post handler
exports.addProduct = async (req, res, next)=>{
    
    
    try {
        const products = req.body;
       
        
        const productExists = await Product.findOne({
            productName: products.productName,
        });

        if(! productExists){
            const images=[];
        

        if(req.files && req.files.length >0 ){
            for (let i=0; i<req.files.length; i++){
                const originalImagePath = req.files[i].path;
                const resizedImagePath = path.join('public', 'uploads', 'product-images' , req.files[i].filename);
                await sharp(originalImagePath).resize({width:277, height:377}).toFile(resizedImagePath);
                images.push(req.files[i].filename);
            }
        }

        // Fetch category id
        const categoryId = await Category.findOne({name: products.category});
        if(!categoryId){
            return res.status(400).json('Invalid category name')
        }

        // Fetch brand id
        const brandId = await Brand.findOne({ brandName: products.brand})
        if(!brandId) {
            return res.status(400).json('Invalid brand name');
        }

        // check category and brand offer!
        const categoryOffer = categoryId.categoryOffer || 0; 
        const brandOffer = brandId.brandOffer || 0;

        const finalOffer = Math.max(categoryOffer, brandOffer, products.productOffer || 0);

        // Calculate sale price based on the highest offer
        const regularPrice = parseFloat(products.regularPrice);
        const salePrice = finalOffer > 0
         ? Math.round(regularPrice - (regularPrice * finalOffer) / 100)
          : regularPrice;


        // prepare color stock data

        const colorStock = [];
        for (let i = 0; i < req.body.colorStock.length; i++) {
           const color = req.body.colorStock[i].color;
           const quantity = Number(req.body.colorStock[i].quantity); // Convert to number
           const status = req.body.colorStock[i].status;

       colorStock.push({
          color: color,
          quantity: quantity,
          status: status,
      });
   }

      const tags = Array.isArray(products.tags) ? products.tags : [products.tags]; // Ensure tags is an array
    



        const newProduct = new Product({
            productName: products.productName,
            description: products.description,
            additionalInfo: products.additionalInfo,
            brand: brandId._id,
            category: categoryId._id,
            regularPrice: products.regularPrice,
            salePrice: salePrice,
            productOffer: products.productOffer || 0, // Default to 0 if not provided
            brandOffer:brandOffer,
            categoryOffer:categoryOffer,
            finalOffer:finalOffer,
            colorStock: colorStock,
            productImage: images,
            isBlocked: products.isBlocked === 'true', // Convert string to boolean
            tags:tags
        });



        await newProduct.save();
        return res.status(201).json({message: 'Product added successfully', product: newProduct})
        // return res.redirect('/api/v1/admin/products/addProduct')

      }else{
        return res.status(400).json('Product already exist, please try witg anoeger name')
      }
    } catch (error) {
        console.error('Error, while adding new produect', error.message)
        next(error)
       
        
    }
}


// Edit
exports.getProductEdit = async (req, res, next)=>{
    
    const id = req.params.id
   

    try {
        const product = await Product.findById(id)
        if(!product){
            return res.status(404).render('404')
        }

        const category = await Category.find({})
        const brand = await Brand.find({})
        res.status(200).render('admin/edit-product', {
            product,
            cat: category,
            brand,
        })
    } catch (error) {
        console.error('Error loading product edit page', error)
        next(error)
    }
}

// product Edit post Handler
exports.editProduct = async (req, res, next)=>{
   

    try {
        const id = req.params.id;
        // const product = await Product.findOne({_id: id});
        const data = req.body

        // Check the product Exists
       const product = await Product.findOne({_id: id });
       if(!product) {
        return res.status(404).json({ message: 'Product not found..!'})
       }
        

        // Check product is exist
        const existingProduct = await Product.findOne({
            productName : data.productName,
            _id: {$ne: id}
        })
        
        if(existingProduct){
            return res.status(400).json({message: 'Product already exists with this naame..!'});
        }


        // Fetching brand category
        const [brandId, categoryId] = await Promise.all([
            Brand.findOne({ _id: data.brand }),
            Category.findOne({ _id: data.category})
        ]);

        if(! brandId) {
            return res.status(400).json({ message : 'Invalid brand name'});
        }

        if(! categoryId) {
            return res.status(400).json({ message : 'Invalid category name'})
        }

        // check category and brand offer!
        const categoryOffer = categoryId.categoryOffer || 0; 
        const brandOffer = brandId.brandOffer || 0;

        const finalOffer = Math.max(categoryOffer, brandOffer, data.productOffer || 0);

         // Calculate sale price based on the highest offer
         const regularPrice = parseFloat(data.regularPrice);
         const salePrice = finalOffer > 0
          ? Math.round(regularPrice - (regularPrice * finalOffer) / 100)
           : regularPrice;

       

        const images = req.files ? req.files.map(file => file.filename) : [];



    const colorStock =(data.colorStock || []).map(item =>({
        color: item.color,
        quantity: Number(item.quantity),
        status: item.status,
    }));

    
    


       const tags = Array.isArray(data.tags) ? data.tags : [data.tags]; // Ensure tags is an array

        
       

       const updatedFields = {
        productName: data.productName,
        description: data.description,
        additionalInfo: data.additionalInfo,
        brand: brandId._id,
        category: categoryId._id,
        regularPrice: data.regularPrice,
        salePrice:salePrice,
        productOffer: data.productOffer || 0, // Default to 0 if not provided
        brandOffer:brandOffer,
        categoryOffer:categoryOffer,
        colorStock: colorStock,
        // productImage: images,
        isBlocked: data.isBlocked === 'true', // Convert string to boolean
        tags:tags
    };
       

        await Product.findByIdAndUpdate(id, {
            $push: { productImage: { $each: images}},
            ...updatedFields
        }, {new: true});
       
        return res.status(200).json({message: "Product updated successfully..!"})
    
        
    
    }catch (error) {
        console.error('Error while adding edited product',error.message);
        next(error)
        
    }
}

// List product // Soft delete
exports.listProduct = async (req, res, next)=>{
    const { id }= req.query;
   
    try {
         const product = await Product.findById(id)

         if(!product){
            return res.status(401).json({ message: "Product not found..!"})
         }

        await Product.updateOne({_id: id}, {$set: {isBlocked: true}})
        res.status(200).json({message: "Product has been listed successfully..!"});
    } catch (error) {
        console.error('Error occured while listing product', error)
        next(error)
        
    }
}

// Unlist product
 
exports.unlistProduct  = async (req, res, next)=>{
    const { id }= req.query;

    try {
        const product = await Product.findById(id);
       
        if(!product){
            return res.status(401).json({ message: "Product not found..!"})
        }

        await Product.updateOne({_id: id}, {$set:{isBlocked: false}})
        res.status(200).json({message: "Product has been unlisted successfully..!"})
    } catch (error) {
        console.error('Error occured while unlisting product', error)
        next(error)
        
    }
}

// Product image delete
exports.deleteSingleProductImage = async (req, res, next)=>{
   
    
    try {
        const {imageNameToServer, productIdToServer}=req.body;
        // remove image
        const product = await Product.findByIdAndUpdate(productIdToServer,{$pull: {productImage: imageNameToServer}});
        const imagePath = path.join('public','uploads', 're-image', imageNameToServer);

        if(fs.existsSync(imagePath)){
            await fs.unlinkSync(imagePath);
           
            
        }else{
            
            
        }
        res.send({status: true});
    } catch (error) {
        console.error('Error occured while deleting image',error.message)
        
    }
}