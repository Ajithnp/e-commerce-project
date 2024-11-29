const express = require ('express')
const mongoose = require ('mongoose')
const path = require ('path')
const session = require ('express-session')
const dotenv = require ('dotenv').config()
const passport = require('./config/passport')
const nocache = require('nocache')

const userRoute = require ('./routes/user-route')
const adminRoute = require ('./routes/admin-route')

const errorHandler = require('./middleware/error-handler')
const morgan = require('morgan')

const app = express()

const PORT = process.env.PORT ||  3001;


app.use(nocache())


// Middleware setup
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Session handling
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 72*60*60*1000
    }
}));

// Morgan middleware...!

// app.use(morgan('common'))


// flash messages,
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set ejs template engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// MONGO DB connection setup
mongoose.connect (process.env.MONGODB_URL)
    .then(()=>console.log( "mongoDB_connected"))
   .catch((error)=>console.log('mongoDB_connection failes...!',error));

// Mounting routes
 app.use('/',nocache(), userRoute)

 app.use('/api/v1/admin',nocache(), adminRoute)


 // 404 error handling middleware
 app.use(( req, res)=>{
    res.status(404).render('404')
//    return res.redirect('/api/v1/admin/login')
 });

 // Error handler
 app.use(errorHandler);

 app.listen(PORT, ()=>console.log('server is running http://localhost:3001'))