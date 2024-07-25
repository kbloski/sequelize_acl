import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    database: 'schoolacl',
    dialect: 'mysql',
    decimalNumbers: true,
    username: 'root',
    password: '',
    host: 'localhost',
    port: 3306
});

sequelize.authenticate().then( ()=> {
    console.log('Connected with database at port 3306');
}).catch( (err)=> {
    console.error(err)
});

export {
    sequelize
}