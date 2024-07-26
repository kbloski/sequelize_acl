import express from 'express';
import expressSession from 'express-session';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { schoolsController } from './controllers/controllers.js';

const __dirname = dirname( fileURLToPath ( import.meta.url ));

const app = express();

app.use( express.urlencoded( {extended: false}));

const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.get('/', async (req, res)=> {
    res.render('pages/index.ejs')
});
app.get('/login', async (req, res)=> {
    res.render('pages/login.ejs')
});
app.get('/register', async (req, res)=> {
    res.render ('pages/register.ejs', {})
});

app.listen(3010, ()=>{
    console.log('Server started at port 3010')
});