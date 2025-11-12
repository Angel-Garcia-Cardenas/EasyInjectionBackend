const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const { User } = require('../models/user/user.model');
const config = require('config');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
            user = new User({
                username: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                emailVerificado: true,
                estado_cuenta: 'activo',
                perfil: 'usuario',
                avatarId: profile.photos[0].value,
                acceptedTerms: true,
                acceptedTermsDate: new Date()
            })
            await user.save();
        } else {
            return done(null, user);
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));