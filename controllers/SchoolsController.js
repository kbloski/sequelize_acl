import { User, School, Subject, Grade} from '../models/schemas.js';

export class SchoolsController{
    async getAll(){
        return await School.findAll({});
    }

    async createSchool(schoolData, directorDb){
        const schoolDb = await School.create({
            ...schoolData
        });

        if (directorDb) await schoolDb.setDirector(directorDb);

        return schoolDb;
    }

    async setDirector(schoolDb, directorDb){
        if (schoolDb && directorDb){
            await schoolDb.setDirector(directorDb);
            return true;
        }
        return false;
    }

    async getById(id){
        return await School.findByPk(id);
    }

    async updateById(id, schoolData){
        const updatedSchool = await School.update({
            ...schoolData
        }, {where: {id: id}});
        
        return updatedSchool;
    }
}