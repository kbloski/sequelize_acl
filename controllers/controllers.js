import { UsersController } from "./UsersController.js";
import { SchoolsController } from "./SchoolsController.js";
import { GradesController } from "./GradesController.js";
import { SubjectsController } from "./SubjectsController.js";

const schoolsController = new SchoolsController();
const usersController = new UsersController();
const subjectsController = new SubjectsController();
const gradesController = new GradesController();

export {
    schoolsController,
    usersController,
    subjectsController,
    gradesController
};
