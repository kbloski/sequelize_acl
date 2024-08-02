import express from 'express';
import expressSession from 'express-session';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { rolesArr } from './models/user_model.js';
import { User } from './models/user_model.js';
import { schoolsController, usersController, gradesController, subjectsController} from './controllers/controllers.js';
import { htmlHelper } from './helpers/htmlHelper.js';

import { passport, checkAuthenticated, checkLoggedIn } from './utility/auth.js'
import { authRole } from './utility/aclauth.js';
import { Socket } from 'dgram';

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
app.get('/grades',  checkAuthenticated, authRole,  async(req,res) => {
    const grades = await gradesController.getAllFullData();

    res.render('pages/grades/index.ejs', {
        user: req.user,
        grades: grades
    })
});

app.get('/grades/add', checkAuthenticated, authRole,  async (req,res) => {
    const schools = await schoolsController.getAll();
    const subjects = await subjectsController.getAll();
    const teachers = await usersController.getAllUsersByRole('teacher');
    const students = await usersController.getAllUsersByRole('student');

    res.render('pages/grades/grade_add.ejs', {
        user: req.user,
        schools: schools,
        subjects: subjects,
        teachers: teachers,
        students: students
    })
});

app.post('/grades/add', checkAuthenticated, authRole, async (req,res) => {
    const gradeDb = await gradesController.createGrade(req.body);

    res.redirect('/grades')
});

app.get('/grades/edit/:id',  checkAuthenticated, authRole,  async (req,res) => {
    const { id } = req.params;
    if (!id) res.redirect('/grades');

    const gradeToEdit = await gradesController.getById(id);
    const schools = await schoolsController.getAll();
    const subjects = await subjectsController.getAll();
    const teachers = await usersController.getAllUsersByRole('teacher');
    const students = await usersController.getAllUsersByRole('student');

    res.render('pages/grades/grade_edit.ejs', {
        user: req.user,
        gradeToEdit: gradeToEdit,
        subjects: subjects,
        schools: schools,
        teachers: teachers,
        students: students
    })
    
});

app.post('/grades/edit/:id', checkAuthenticated, authRole, async (req,res) => {
    const { id } = req.params;
    if (!id) res.redirect('/grades')
    
    const updatedGradeDb = await gradesController.updateById(id, req.body);
    
    res.redirect('/grades');
});

app.get('/grades/view/:id', checkAuthenticated, authRole, async (req,res) => {
    const { id } = req.params;
    if (!id) res.redirect('/grades');

    const gradeToView = await gradesController.getByIdFullData(id);

    res.render('pages/grades/grade_view.ejs', {
        user: req.user,
        gradeToView: gradeToView
    })
    
});

app.get('/subjects/view/:subjectId/addstudent',  checkAuthenticated, authRole,  async(req,res) => {
    const { subjectId } = req.params;
    if (!subjectId) res.redirect('/subjects');

    const subjectDb = await subjectsController.getById(subjectId);
    
    const subjectStudents =  await subjectsController.getStudentsForSubjectById( subjectId );
    const allStudents = await usersController.getAllUsersByRole('student');

    let studentsDb = allStudents;
    if (subjectStudents){
        const subjectsStudentsIds = new Set(subjectStudents.map( obj => obj.id));
        studentsDb = allStudents.filter( obj => !subjectsStudentsIds.has(obj.id) )
    }
    
    
    res.render('pages/subjects/subject_addUser.ejs', {
        user: req.user,
        subject: subjectDb,
        students: studentsDb
    })
});

// add student to subject
app.get('/subjects/view/:subjectId/addstudent/:studentId',  checkAuthenticated, authRole,  async(req,res) => {
    const { subjectId, studentId} = req.params;
    if (!studentId || !subjectId) res.redirect('/subjects')
    
    const subjectDb = await subjectsController.getById(subjectId);
    const studentDb = await usersController.getById(studentId);

    await subjectsController.addUserToSubject(studentDb, subjectDb);

    res.redirect('/subjects/view/'+ subjectId+'/addstudent/')
});

app.get('/subjects/view/:id', checkAuthenticated, authRole, async(req,res) => {
    const {id} = req.params;
    if (!id) res.redirect('/subjects');

    const subjectToView = await subjectsController.getByIdFullData(id);
    const schools = await schoolsController.getAll();
    const teachers = await usersController.getAllUsersByRole('teacher');
    const students = await subjectsController.getStudentsForSubjectById(id);

    res.render('pages/subjects/subject_view.ejs', {
        user: req.user,
        subjectToView: subjectToView,
        students: students, 
        schools: schools,
        teachers: teachers
    })

});

// add grade to student in subject
app.get('/subjects/view/:subjectId/student/:studentId/addgrade', async (req,res) => {
    const { subjectId, studentId} = req.params;
    if (!subjectId || !studentId) res.redirect('/subjects');
    
    const subjectDb = await subjectsController.getById(subjectId);
    const studentDb = await usersController.getById(studentId);
    const schoolDb = await schoolsController.getById( subjectDb.schoolId);

    const teachersDb = await usersController.getAllUsersByRole('teacher');


    res.render('pages/subjects/subject_addGrade.ejs', {
        user: req.user,
        subject: subjectDb,
        student: studentDb,
        teachers: teachersDb,
        school: schoolDb

    })
});

app.post('/subjects/view/:subjectId/student/:studentId/addgrade', async (req,res) => {
    const { subjectId, studentId} = req.params;
    if ( !studentId || !subjectId ) res.redirect('/subjects');

    let gradeData = {
        grade: req.body.grade,
    };
    gradeData.description = req.body?.description;

    const studentDb = await usersController.getById(studentId);
    const teacherDb = await usersController.getById(req.body.teacherId);
    const subjectDb = await subjectsController.getById(subjectId);
    const schoolDb = await schoolsController.getById(req.body.schoolId);

    const gradeDb = await gradesController.createGrade( gradeData, studentDb, teacherDb, subjectDb,  schoolDb);

    res.redirect('/subjects/view/'+ subjectId)
});



app.get('/subjects/edit/:id',  checkAuthenticated, authRole,  async (req,res) => {
    const {id} = req.params;

    const subjectEdit = await subjectsController.getById(id)
    const schools = await schoolsController.getAll();
    const teachers = await usersController.getAllUsersByRole('teacher');
    
    res.render('pages/subjects/subject_edit.ejs', {
        user: req.user,
        subjectEdit: subjectEdit,
        schools: schools,
        teachers: teachers
    })
});

app.post('/subjects/edit/:id', checkAuthenticated, authRole, async (req,res) => {
    const { id } = req.params;
    if (!id ) req.redirect('/subjects');

    const updatedSubject = await subjectsController.updateById(id, req.body)

    res.redirect('/subjects')
});

app.get('/subjects/add', checkAuthenticated, authRole, async (req,res) => {
    const schools = await schoolsController.getAll();
    const teachers = await usersController.getAllUsersByRole('teacher');

    res.render('pages/subjects/subjects_add.ejs', 
        { 
            user: req.user,
            schools: schools,
            teachers: teachers
        }
    )
});

app.post('/subjects/add', checkAuthenticated, authRole, async (req,res) => {
    const subjectsDb = await subjectsController.createSubject(req.body);
    
    res.redirect('/subjects');
});

app.get('/subjects',  checkAuthenticated, authRole,  async(req,res) => {
    const subjects = await subjectsController.getAll();
    const schools = await schoolsController.getAll();
    const teachers = await usersController.getAllUsersByRole('teacher');
    
    res.render('pages/subjects/index.ejs', {
        user: req.user,
        subjects: subjects,
        schools: schools,
        teachers: teachers
    })
});



app.get('/admin/schools/edit/:id', checkAuthenticated, authRole, async (req,res) => {
    const {id} = req.params;
    
    const schoolDb = await schoolsController.getById(id)    
    const directorsDb = await usersController.getAllUsersByRole('director');
    
    res.render('pages/admin/schools_edit.ejs', 
        { 
            user: req.user,
            directors: directorsDb,
            school: schoolDb
        }
    )
});

app.post('/admin/schools/edit', checkAuthenticated, authRole, async (req,res) => {
    let schoolData =  {
        name: req.body.name,
    };
    schoolData.address = (req.body.address) ? req.body.address : undefined;
    await schoolsController.updateById(req.body.id, schoolData);
    
    const schoolDb = await schoolsController.getById( req.body.id );
    const directorDb = await usersController.getById(req.body.directorId);

    await usersController.updateById( req.body.directorId, {schoolId: schoolDb.id})

    res.redirect('/admin/schools')
});

app.get('/admin/schools/view/:id',  checkAuthenticated, authRole,  async (req,res) => {
    const { id } = req.params;
    if (!id) res.redirect('/admin/schools')

    const schoolDb = await schoolsController.getFullDataById(id);
    const directorsDb = await usersController.getAllUsersByRole('director');
    const directorToView = directorsDb.filter(v => v.schoolId == schoolDb.id)[0];
    const teachers = await usersController.getAllUsersByRoleAndSchoolId('teacher', schoolDb.id);

    res.render('pages/admin/schools_view.ejs', 
        {
            user: req.user,
            schoolToView: schoolDb,
            directorToView: directorToView,
            teachers: teachers
        }
    )
}) 

// add subject to school
app.get('/admin/schools/view/:id/addsubject',  checkAuthenticated, authRole,  async (req,res) => {
    const { id } = req.params;
    if (!id) res.redirect('/admin/schools')

    const schoolDb = await schoolsController.getFullDataById(id);
    const teachers = await usersController.getAllUsersByRoleAndSchoolId('teacher', schoolDb.id);

    res.render('pages/admin/schools/schools_addSubject.ejs', 
        {
            user: req.user,
            schoolId: schoolDb.id,
            schoolToView: schoolDb,
            teachers: teachers
        }
    )
}) 

app.post('/admin/schools/view/:id/addsubject',  checkAuthenticated, authRole,  async (req,res) => {
    const { id } = req.params;
    if (!id) res.redirect('/admin/schools')

    const subjectDb = await subjectsController.createSubject(req.body);

    res.redirect('/admin/schools/view/'+id)
}) 


// add teacher to school
app.get('/admin/schools/view/:id/addteacher',  /*  checkAuthenticated, authRole, */  async (req,res) => {
    const { id } = req.params;
    if (!id) res.redirect('/admin/schools')

    const schoolDb = await schoolsController.getFullDataById(id);

    res.render('pages/admin/schools/schools_addTeacher.ejs', 
        {
            user: req.user,
            schoolId: schoolDb.id,
            schoolToView: schoolDb,
        }
    )
}) 

app.post('/admin/schools/view/:id/addteacher', /*  checkAuthenticated, authRole, */  async (req,res) => {
    const { id } = req.params;
    if (!id) res.redirect('/admin/schools')

        let userData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            schoolId: id,
            role: req.body.role
        };

        if (req.body.surname) userData.surname = req.body.name;
        if (req.body.age) userData.age = req.body.age;
        if (req.body.address) userData.address = req.body.address;

    const userDb = await usersController.createUser(userData);

    res.redirect('/admin/schools/view/'+id);
}) 



app.get('/admin/schools', checkAuthenticated, authRole, async (req,res) => {
    const schoolsDb = await schoolsController.getAll();
    const directorsDb = await usersController.getAllUsersByRole('director');

    res.render('pages/admin/schools.ejs', 
        {
            user: req.user,
            schools: schoolsDb,
            directors: directorsDb
        }
    )
}) 

app.get('/admin/schools/add', checkAuthenticated, authRole, async (req,res) => {
    const directorsDb = await usersController.getAllUsersByRole('director');

    res.render('pages/admin/schools_add.ejs', 
        { 
            user: req.user,
            directors: directorsDb
        }
    )
});

app.post('/admin/schools/add', async (req,res) => {
    const schoolData = {
        name: req.body.name
    }
    schoolData.address = (req.body.address) ? req.body.address : undefined;
    const schoolDb = await schoolsController.createSchool(schoolData);
    const directorDb = await usersController.updateById( req.body.directorId, {schoolId: schoolDb.id})

    res.redirect('/admin/schools');
});


app.get('/admin/users/view/:id',  checkAuthenticated, authRole,   async(req,res) => {   
    const { id } = req.params;
    if (!id) res.render('/admin/users');

    

    const userToView = await usersController.getByIdFullData(id);
    const schoolsDb = await schoolsController.getAll();
    const grades = await gradesController.getGradesByStudentId(id);
    res.render('pages/admin/users_view.ejs', {
        user: req.user,
        userToView: userToView,
        schools: schoolsDb,
        grades: grades
    });
});

app.get('/admin/users/edit/:id', checkAuthenticated, authRole,  async(req,res) => {
    const schoolsDb = await schoolsController.getAll();
    const roles = rolesArr.filter( role => role !== 'admin');
   
    const { id } = req.params;
    const editUser = await usersController.getById(id);

    res.render('pages/admin/users_edit.ejs', {
        user: req.user,
        editUser: editUser,
        schools: schoolsDb,
        rolesArr: roles
    })
});

app.post('/admin/users/edit', async (req,res) => {
    let userData = {
        name: req.body.name,
        email: req.body.email,
        // password: req.body.password,
        role: req.body.role,
    };

    
    userData.name = (req.body.name) ? req.body.name : undefined;
    userData.surname = (req.body.surname) ? req.body.surname : undefined;
    userData.age = (req.body.age) ? req.body.age : undefined;
    userData.address = (req.body.address) ? req.body.address : undefined;
    userData.schoolId = (req.body.schoolId) ? req.body.schoolId : undefined;
    
    await User.update(userData, { where: { id: req.body.id }});

    res.redirect('/admin/users');
});


app.get('/admin/users/add', checkAuthenticated, authRole, async (req,res) => {

    const schoolsDb = await schoolsController.getAll();
    // console.log(Array.isArray(rolesArr))
    const roles = rolesArr.filter( role => role !== 'admin');
    
    res.render ('pages/admin/users_add.ejs', {
        user: req.user,
        schools: schoolsDb,
        rolesArr: roles,
    })
});

app.post('/admin/users/add', checkAuthenticated, authRole, async (req,res) => {
    let userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    };
    if (req.body.surname) userData.surname = req.body.name;
    if (req.body.age) userData.age = req.body.age;
    if (req.body.address) userData.address = req.body.address;
    if (req.body.schoolId) userData.schoolId = req.body.schoolId;
    if (req.body.role) userData.role = req.body.role; 
    
    await usersController.createUser(userData);

    res.redirect('/admin/users');
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