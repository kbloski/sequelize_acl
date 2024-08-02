const usersRoles = [
    {
        role: 'admin',
        allows: [
            { resource: '/admin/users', permissions: '*' },
            { resource: '/admin/users/add', permissions: '*' },
            { resource: '/admin/users/edit/:id', permissions: '*'},
            { resource: '/admin/schools', permissions: '*'},
            { resource: '/admin/schools/add', permissions: '*'},
            { resource: '/admin/schools/edit/:id', permissions: "*" },
            { resource: '/admin/schools/edit', permissions: '*'}
        ]
    },
    {
        role: 'user',
        allows: [
            { resource: '/dashboard', permissions: [ 'post', 'get ']}
        ]
    },
    {
        role: 'guest',
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
        if (userRole === 'admin') return true;
        
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
    }
};

permissions.addRoleParrents('user', 'guest');
permissions.addRoleParrents('admin', 'user');
// console.log( JSON.stringify(usersRoles, null, 4))

export {
    permissions
};