import passport from "passport";
import LocalStrategy from 'passport-local';
import { usersController } from "../controllers/controllers.js";

// Let logged in user visit in him url
const checkAuthenticated = (req, res, next) => {
    if ( req.isAuthenticated() ) return next(); // if logged in do next()
    return res.redirect('/');
}

// Block for logged in user register, login, itp
const checkLoggedIn = (req, res, next) => {
    if ( req.isAuthenticated() ) return res.redirect('/dashboard');
    return next(); 
}


// *** Passport ***

passport.serializeUser( (user, done) => {
    return done(null, user.id)
});

passport.deserializeUser( async (id, done) => {
   const userDb = await usersController.getById(id);

    return done(null, userDb)
});



passport.use(
    'local-login',
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        // passReqToCallback: true - jeśli chesz również przyjmować argumenty z req.body
    },
    async ( /* req,*/ email, password, done) => {
        try {
            const userExists = await usersController.getUserByEmail(email);

            if (!userExists) return done(null, false);
            
            const validResoult = await usersController.validPassword(password, userExists);
            if ( !validResoult ) return done(null, false);
            
            return done(null, userExists)

        } catch (err) {
            done(err)
        }
    }
));

passport.use(
    'local-register',
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    },
    async (req, email, password, done) => {

        try {
            if (await usersController.getUserByEmail(email)) return done(null, false);
            console.log(req.body.name,'-----------------------')
            const userDb = await usersController.createUser({
                name: req.body.name,
                surname: req.body.surname,
                email: email,
                password: password,
                age: req.body.age,
                address: req.body.address,
                schoolId: req.body.schoolId,
            });
            console.log(userDb)
            
            return done(null, userDb);
        } catch (err) {
            console.error(err)
        }
        
    }
));

export {
    passport,
    checkAuthenticated,
    checkLoggedIn
}