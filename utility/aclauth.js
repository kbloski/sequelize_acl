import { permissions } from "./permission.js";

function authRole(req, res, next){
    const resource = req.route.path;
    const method = req.method.toLowerCase();

    let userRole = 'guest';
    if (req.user){
        if (req.user.role === 'admin'){
            userRole = 'admin';
        } else if (req.user.role) {
            userRole = 'user'
        }
    }
    

    if (!permissions.isResourceAllowedForUser(userRole, resource, method)){ 
        {
            res.status(401);
            return res.send('Nie posiadasz uprawnień')
        }
    }
    // user have a permissions
    return next();
}

export {
    authRole
}