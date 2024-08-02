import bcrypt from 'bcryptjs';
import { User, School, Grade, Subject } from '../models/schemas.js';

export class UsersController {
    async getAll(){
        return await User.findAll({});
    }

    async getAllUsersByRole(role){
        return await User.findAll({
            where: {
                role: role
            }
        })
    }

    async createUser(userData, schoolDb){
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
        
        const userDb = await User.create(userData);

        if (schoolDb) await userDb.setSchool(schoolDb);

        return userDb;
    }

    async validPassword(password, userDb){
        
        try {
            if (password && userDb) return await bcrypt.compare(password, userDb.password);  
            return false;
        } catch (err) {
            throw new Error(err);
        }
    }

    async setSchool(userDb, schoolDb){
        if (userDb && schoolDb){
            await userDb.setSchool(schoolDb)
        };
        return false;
    }

    async getById(id) {
        return await User.findByPk(id);
    }

    async getByIdFullData(id) {
        return await User.findByPk(id, {
            include: {
                model: Subject,
                include: [
                    { model: User, as: 'teacher'},
                    { 
                        model: Grade,
                        include: [
                            { model: School},
                            { model: User, as: 'teacher'} 
                        ],
                        where: {
                            studentId: id
                        }
                    },
                    { model: School}
                ]
            }
        });
     
    }

    async updateById(id, userData){
        const updatedUser = await User.update({
            ...userData
        }, {
            where: {
                id: id
            }
        }) 
    };

    async getUserByEmail(email){
        return await User.findOne({where: { email: email}})
    }
    
};
