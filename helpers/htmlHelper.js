import { permissions } from "../utility/permission.js";


class HtmlHelper {

    
    getSelectIdCodeFromArr(arr, selectName, propertyToShow, id, className, selectedId = -1){
        let idCode = '';

        if (id) idCode = `id='${id}'`;

        let html = ` <select name='${selectName}' ${idCode} class='${className}'>`;
        html+= '\n<option disabled>-- Choices --</option>'

        for (const el of arr) {
            let data = '';
            if (selectedId === el.id) data = 'selected';
            
            html += `\n <option value='${el.id}' ${data}> ${el[propertyToShow]} </option>`;
        };

        return html + '\n</select>';
    };

    // arr = ['admin', 'teacher']
    getSelectCodeFromArr(arr, selectName, id, className, selectedValue){
        let idCode  = '';
        if (id) idCode = `id='${id}'`;

        let html = `<select name='${selectName}' ${idCode} class='${className}'>`;
        html+= '\n<option disabled>-- Choices --</option>'

        for (const str of arr) {
            let data = '';
            if (selectedValue === str) data = 'selected';

            html += `\n <option value='${str}' ${data}>${str}</option>`;
        }

        return html + '\n </select>'
    };


    getElValueFromArrById(arr, id, propertyToShow = 'id'){
        for ( const el of arr ){
            if (el.id == id) return el[propertyToShow];
        };
        return null;
    }
    
    getLinkCodeForUserRoleOrHigher(
        userRole,
        minRoleForLink = 'admin',
        href,
        linkText,
        className =''
    ){
        const userPriority = permissions.getPriorityByRole(userRole);
        const minRolePriorityToSeeLink = permissions.getPriorityByRole(minRoleForLink);

        if ( userPriority >= minRolePriorityToSeeLink){
            return `<a href='${href}' class='${className}'>${linkText}</a>`
        }
        return '';
    }

    hasAccessForUserRoleOrHigher( userRole, minRoleForAccess = 'admin') {
        const userPriority = permissions.getPriorityByRole(userRole);
        const minRolePriorityToSeeLink = permissions.getPriorityByRole(minRoleForLink);

        if ( userPriority >= minRolePriorityToSeeLink){
            return true
        }
        return false
    }

};

const htmlHelper = new HtmlHelper();

export {
    htmlHelper
};