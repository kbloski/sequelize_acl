import passport from 'passport';
import LocalStrategy from 'passport-local';
import { usersController } from '../controllers/controllers.js';

passport.serializeUser( (user, done) => {
    done(null, user.id);
});

passport.deserializeUser( async (id, done) => {
    try {
        const userDb = await usersController.getById(id);
        done(null, userDb)
    } catch (err) {
        done(err)
    }
});

// *** register
passport.use(
    'local-signup',
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // ten parametr pozwala na otrzymacie jeszcze dodatkowo requesta do callback 
    },
    async (req, email, password, done) => {
        try {
            const userExists = await usersController.getUserByEmail(email);
            
            if (userExists) return done(null, false);

            const userDb = usersController.createUser({
                name: req.body.name,
                surname: req.body.surname,
                email: email,
                password: password,
                age: req.body.age,
                address: req.body.address,
                schoolId: req.body.schoolId
            });
            return done(null, userDb);


        } catch (err) {
            done(err)
        }
    }
));

const authUser = async (req, email, password, done) => {
    try {

        const authenticatedUser = await usersController.getUserByEmail(email);
        
        if (!authenticatedUser) return done(null, false); // nie ma takiego użtkownika
        if (!usersController.validPassword(password, authenticatedUser)) return done(null, false); // niepoprawne hasło

        return done(null, authenticatedUser); // zalogowany

    } catch (err) {
        return done(err)
    }
};

passport.use(
    'local-login',
    new LocalStrategy({
        emailField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    authUser
));

export {
    passport
};