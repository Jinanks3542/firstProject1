const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./model/userModel");
require('dotenv').config();


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENTID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "https://jinanks.shop/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
               
         
                const { id: googleId, email, displayName: name } = profile;

                let user = await User.findOne({ email: profile._json.email });
                if (!user) {
                  
                    user = await User.create({
                        googleId,
                        email: profile._json.email,
                        name,
                        password:googleId,
               
                        mobile:'08958093553'
                    });
                    console.log(user)
                }
                console.log(user)

               
                return done(null, user);
            } catch (error) {
                console.error("Error during Google authentication:", error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = {
    googleAuth: passport.authenticate("google", { scope: ["profile", "email"] }),

    googleCallback: passport.authenticate("google", {
        failureRedirect: "/login",
      
    }),

    setupSession: (req, res, next) => {
 
        if (req.isAuthenticated()) {
         
            req.session.userId = req.user._id;
        } 
        console.log(req.session.userId);
        res.redirect("/");
    },
};