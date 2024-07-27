class HtmlHelper {

    getSelectIdCodeFromArr(arr, selectName, propertyToShow, id, className, selectedId = -1){
        let idCode = '';

        if (id) idCode = `id='${id}'`;

        let html = ` <select name='${selectName}' ${idCode} class='${className}'>`;

        for (const el of arr) {
            let data = '';
            if (selectedId === el.id) data = 'selected';
            
            html += `\n <option value='${el.id}' ${data}> ${el[propertyToShow]} </option>`;
        };

        return html + '\n</select>';
    };

};

const htmlHelper = new HtmlHelper();

export {
    htmlHelper
};