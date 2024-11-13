const multer = require ('multer')
const path = require ('path')

//Multer config.....!
const storage = multer.diskStorage({        //Create a instance for store files(images) and specify their position.
    destination: (req, file, cb)=>{
        cb(null, path.join(__dirname, '../public/uploads/re-image'));
    },
    filename: (req, file, cb)=>{        // To set unique names
        cb(null,Date.now()+"-"+file.originalname);
    }
})    

module.exports = storage;