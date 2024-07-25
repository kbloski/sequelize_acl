import express from 'express';
import expressSession from 'express-session';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname( fileURLToPath ( import.meta.url ));

const app = express();

app.use( express.urlencoded( {extended: false}));

const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.get('/', (req, res)=> {
    res.send('Homepage')
});

app.listen(3010, ()=>{
    console.log('Server started at port 3010')
});