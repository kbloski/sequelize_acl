const usersRoles = [
    {
        role: 'admin',
        priority: 5,
        allows: [
           
            
            { resource: '/admin/schools/add', permissions: '*'},
            { resource: '/admin/schools/edit/:id', permissions: "*" },
            { resource: '/admin/schools', permissions: '*'},
        ]
    },
    {
        role: 'director',
        priority: 4,
        allows: [
            { resource: '/admin/schools/myschool', permissions: '*'},
            { resource: '/admin/schools/view/:id', permissions: '*'},
            { resource: '/admin/users', permissions: '*' },
            { resource: '/admin/users/add', permissions: '*' },
            { resource: '/admin/users/edit/:id', permissions: '*'},
            { resource: '/admin/users/view/:id', permissions: '*'},
            { resource: '/subjects/add', permissions: '*'},
            { resource: '/subjects/edit/:id', permissions: '*'},
        ]
    },
    {
        role: 'teacher',
        priority: 3,
        allows: [
            { resource: '/subjects', permissions: '*'},
            { resource: '/subjects/view/:id', permissions: '*'},
            { resource: '/subjects/view/:subjectId/addstudent', permissions: '*'},
            { resource: '/subjects/view/:subjectId/student/:studentId/addgrade', permissions: '*'},
            { resource: '/grades', permissions: '*'},
            { resource: '/grades/add', permissions: '*'},
            { resource: '/grades/view/:id', permissions: '*'},
            { resource: '/grades/edit/:id', permissions: '*'},
        ]
    },
    {
        role: 'student',
        priority: 2,
        allows: [
            { resource: '/dashboard', permissions: [ 'post', 'get ']}
        ]
    },
    {
        role: 'guest',
        priority: 1,
        allows: [
            { resource: '/', permissions: [ 'get' ]}
        ]
    }
];

const permissions = {
    usersRoles: usersRoles,
    addRoleParrents: function(targetRole, sourceRole) {
        const targetData = this.usersRoles.find( v => v.role == targetRole);
        const sourceData = this.usersRoles.find( v => v.role == sourceRole);

        targetData.allows = targetData.allows.concat( sourceData.allows );
    },
    isResourceAllowedForUser: function (userRole, resource, method){
        if (userRole === 'admin') return true; // allow for all to admin
        
        const roleData  = this.usersRoles.find( v => v.role == userRole);

        if (!roleData) return false;
        

        const resourceData = roleData.allows.find( v => v.resource == resource);
        if (!resourceData) return false;
        if (!resourceData.permissions) return false;

        if (!Array.isArray( resourceData.permissions)){
            if ( resourceData.permissions === '*') return true;
            if ( resourceData.permissions === method ) return true;
        } else {
            if ( resourceData.permissions.find( v => v === '*')) return true;
            if ( resourceData.permissions.find( v => v === method)) return true;
        }

        return false;
    },
    getPriorityByRole: function(role){

        const user = this.usersRoles.find( v => v.role === role);
        if (user) return user.priority;
        return -1;
    }
};

permissions.addRoleParrents('student', 'guest');
permissions.addRoleParrents('teacher', 'student');
permissions.addRoleParrents('director', 'teacher');
permissions.addRoleParrents('admin', 'director');
// console.log(usersRoles)

export {
    permissions
};