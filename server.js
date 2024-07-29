import express from 'express';
import expressSession from 'express-session';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { rolesArr } from './models/user_model.js';
import { schoolsController, usersController, gradesController, subjectsController} from './controllers/controllers.js';
import { htmlHelper } from './helpers/htmlHelper.js';

import { passport, checkAuthenticated, checkLoggedIn } from './utility/auth.js'
import { authRole } from './utility/aclauth.js';

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
app.get('/admin/users/edit/:id', checkAuthenticated, authRole,  async(req,res) => {
    res.render('pages/admin/users_edit.ejs', {user: req.user})
})


app.get('/admin/users/add', checkAuthenticated, authRole, async (req,res) => {

    const schoolsDb = await schoolsController.getAll();
    console.log(Array.isArray(rolesArr))
    const roles = rolesArr.filter( role => role !== 'admin');
    
    res.render ('pages/admin/users_add.ejs', {
        user: req.user,
        schools: schoolsDb,
        rolesArr: roles,
    })
});

app.post('/admin/users/add', checkAuthenticated, authRole, async (req,res) => {
    await usersController.createUser({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        password: req.body.password,
        age: req.body.age,
        role: req.body.role,
        address: req.body.address,
        schoolId: req.body.schoolId, 
    });

    redirect('/admin/users');
});

app.get('/admin/users', checkAuthenticated, authRole,  async (req, res) => {
    const usersDb = await usersController.getAll();

    res.render('pages/admin/users.ejs', { 
        user: req.user, 
        users: usersDb
    });
});

app.get('/dashboard', checkAuthenticated ,async (req,res) => {
    res.render('pages/dashboard.ejs', {
        user: req.user
    })
})

app.get('/register', checkLoggedIn,  async (req, res)=> {
    const schoolsDb = await schoolsController.getAll();
    res.render ('pages/register.ejs', {
        user: req.user,
        schools: schoolsDb,
    })
});

app.post('/register', passport.authenticate('local-register', {
    successRedirect: '/dashboard',
    failureRedirect: '/register'
}));

app.get('/login', checkLoggedIn, async(req,res) => {
    res.render('pages/login.ejs', {
        user: req.user
    })
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
    res.render('pages/index.ejs', {
        user: req.user
    })
});

app.listen(3010, ()=>{
    console.log('Server started at port 3010')
});