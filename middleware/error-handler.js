const errorHandler = (error, req, res, next)=>{
    console.error (error.stack)  // error stack for debugging

    // set response status code based on the error default 500

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message : error.message || 'Internal Server Error', status : statusCode});

};

module.exports = errorHandler;