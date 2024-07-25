import { sequelize } from "../utility/db.js";
import { DataTypes } from "sequelize";

const Subject = sequelize.define('Subject',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        validate: { isInt: true }
    },
    name: {
        type: DataTypes.STRING(32),
        allownull: false,
        validate: { len: [1,32] }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

export {
    Subject
}