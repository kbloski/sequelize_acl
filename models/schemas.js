import { sequelize } from "../utility/db.js";
import { User } from "./user_model.js";
import { School } from "./school_model.js";
import { Grade } from "./grade_model.js";
import { Subject } from "./subject_model.js";

// *** School's relations ***
School.hasMany(User, {
    foreignKey: 'schoolId'
});
User.belongsTo(School, {
    foreignKey: 'schoolId'
});

School.belongsTo(User, {as: 'director'}); // w szkole powstanie director Id wskazujący na user

// *** subject's relations *** 
School.hasMany(Subject, {
    foreignKey: 'schoolId'
})
Subject.belongsTo(School, {
    foreignKey: 'schoolId'
});

// connection table 
const SubjectUser = sequelize.define('SubjectUser', {}, {timestamps: false});

Subject.belongsToMany(User, {
    through: SubjectUser,
    foreignKey: 'subjectId'
});
User.belongsToMany(Subject, {
    through: SubjectUser,
    foreignKey: 'userId'
});

Subject.belongsTo(User, {as: 'teacher'}); // method subject.setTeacher()

// *** Grade's ralations ***
Subject.hasMany(Grade, {
    foreignKey: 'subjectId'
});
Grade.belongsTo(Subject, {
    foreignKey: 'subjectId'
});

Grade.belongsTo(User, {as: 'teacher'});

User.hasMany(Grade, {
    foreignKey: 'studentId'
});
Grade.belongsTo(User, {
    foreignKey: 'studentId'
});

Grade.belongsTo(School, {
    foreignKey: 'schoolId'
});

await sequelize.sync({});

export {
    User,
    School,
    Subject,
    Grade
}