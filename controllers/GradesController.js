import { User, School, Subject, Grade } from '../models/schemas.js';

export class GradesController{
    async getAll(){
        return await Grade.findAll({});
    };

    async createGrade(gradeData, studentDb, teacherDb, schoolDb){
        const gradeDb = await Grade.create({
            ...gradeData
        });

        if (studentDb) await gradeDb.setUser(studentDb);
        if (teacherDb) await gradeDb.setTeacher(teacherDb);
        if (schoolDb) await gradeDb.setSchool(schoolDb);

        return gradeDb;
    };

    async getById(id){
        return await User.findByPk(id);
    };

    async updateById(id, gradeData){
        const updatedGrade = await Grade.update({
            ...gradeData
        }, {where: {id:id}});
    
        return updatedGrade;
    }
}