import express from 'express';
import expressSession from 'express-session';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { schoolsController, usersController, gradesController, subjectsController} from './controllers/controllers.js';
import { htmlHelper } from './helpers/htmlHelper.js';

import { passport, checkAuthenticated, checkLoggedIn } from './utility/auth.js'

const __dirname = dirname( fileURLToPath ( import.meta.url ));

const app = express();

// *** Add local properties for views
app.locals.htmlHelper = htmlHelper; // dodanie lokalnego property dla widoków

app.use( express.urlencoded( {extended: false}));

const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// *** Passport *** 
app.use(expressSession({
    secret: 'mY_s3creTT_C0D3',
    resave: false,
    saveUninitialized: true
}));

app.use( passport.initialize());
app.use( passport.session());




// *** Hosting ***

app.get('/dashboard', checkAuthenticated ,async (req,res) => {
    res.render('pages/dashboard.ejs')
})

app.get('/register', checkLoggedIn,  async (req, res)=> {
    const schoolsDb = await schoolsController.getAll();


    res.render ('pages/register.ejs', {
        schools: schoolsDb,
    })
});

app.post('/register', passport.authenticate('local-register', {
    successRedirect: '/dashboard',
    failureRedirect: '/register'
}));

app.get('/login', checkLoggedIn, async(req,res) => {
    res.render('pages/login.ejs')
});

app.post('/login', passport.authenticate('local-login',{
    successRedirect: '/dashboard',
    failureRedirect: '/login'
}));

app.get('/logout', (req, res, next) => {
    req.logout( 
        function (err){
            if (err) return next(err);
            res.redirect('/')
        }
    );
});

app.post('/logout', (req, res, next) => {
    req.logout( 
        function (err){
            if (err) return next(err);
            res.redirect('/')
        }
    );
});

app.get('/', async (req, res)=> {
    res.render('pages/index.ejs')
});

app.listen(3010, ()=>{
    console.log('Server started at port 3010')
});