const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user-model');
const dotenv = require('dotenv').config()


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
       },
       async (accessToken, refreshToken, profile, done) =>{
        // Handle user profile here (create or find user in DB)
          try {
            let user = await User.findOne({googleId: profile.id});

              if (user){
                 return done(null,user)
              } else {  // Create user
                  user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id
                  });
                  await user.save();
                  return done(null,user);
                  
              }
            
          } catch (error) {
            return done(error, null)
            
          }
       }
   )
);

// Serialize user data for assign user data in session

passport.serializeUser((user, done)=>{
    done (null, user.id);
});

// Deserialize for fetch user data from session

passport.deserializeUser(async (id, done)=>{
    try {
        const user = await User.findById(id); // Find user by ID
        
        done(null, user) // Store user object in req.user
        
    } catch (error) {
        done(error, null)
        
    }
});


module.exports = passport;