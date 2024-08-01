import { User, School, Subject, Grade } from '../models/schemas.js';

export class GradesController{
    async getAll(){
        return await Grade.findAll({});
    };

    async getAllFullData(){
        return await Grade.findAll({
            include:[
                { model: User},
                { model: Subject}, 
                { model: School },
                { model: User, as: 'teacher'}
            ]
        })
    }

    async createGrade(gradeData, studentDb, teacherDb, subjectDb, schoolDb){
        const gradeDb = await Grade.create({
            ...gradeData
        });

        if (studentDb) await gradeDb.setUser(studentDb);
        if (teacherDb) await gradeDb.setTeacher(teacherDb);
        if (schoolDb) await gradeDb.setSchool(schoolDb);
        if (subjectDb) await gradeDb.setSubject(subjectDb);

        return gradeDb;
    };

    async getById(id){
        return await Grade.findByPk(id);
    };

    async getByIdFullData(id) {
        return await Grade.findOne({
            where: {
                id: id
            },
            include: [
                { model: User},
                { model: Subject},
                { model: School },
                { model: User, as: 'teacher'}
            ]
        })
    }

    async updateById(id, gradeData){
        const updatedGrade = await Grade.update({
            ...gradeData
        }, {where: {id:id}});
    
        return updatedGrade;
    }

    async getGradesByStudentId(studentId) {
        return await Grade.findOne({
            where: {
                id: id
            },
            include: [
                { model: User},
                { model: Subject},
                { model: School },
                { model: User, as: 'teacher'}
            ]
        })
    }
}