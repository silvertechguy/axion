const http = require('http');
const express = require('express');
const cors = require('cors');
const User = require("../entities/user/User.manager");
const School = require("../entities/school/School.manager");
const Classroom = require("../entities/classroom/Classroom.manager");
const Student = require("../entities/student/Student.manager");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();

module.exports = class UserServer {
    constructor({config, managers, validators, cortex, mongomodels}) {
        this.config = config;
        this.managers = managers;
        this.validators = validators;
        this.cortex = cortex;
        this.mongomodels = mongomodels;
        this.userApi = managers.userApi;
        this.responseDispatcher = managers.responseDispatcher;
        this.user = new User({
            utils: null,
            cache: null,
            config: this.config,
            cortex: this.cortex,
            managers: this.managers,
            validators: this.validators,
            mongomodels: this.mongomodels,
        });
        this.school = new School({
            utils: null,
            cache: null,
            config: this.config,
            cortex: this.cortex,
            managers: this.managers,
            validators: this.validators,
            mongomodels: this.mongomodels,
        });
        this.classroom = new Classroom({
            utils: null,
            cache: null,
            config: this.config,
            cortex: this.cortex,
            managers: this.managers,
            validators: this.validators,
            mongomodels: this.mongomodels,
        });
        this.student = new Student({
            utils: null,
            cache: null,
            config: this.config,
            cortex: this.cortex,
            managers: this.managers,
            validators: this.validators,
            mongomodels: this.mongomodels,
        });
    }

    /** for injecting middlewares */
    use(args) {
        app.use(args);
    }

    /** server configs */
    run() {
        app.use(cors({origin: '*'}));
        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.use('/static', express.static('public'));
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(YAML.load('./swagger/swagger.yaml')));

        // auth
        app.post('/api/auth/register', async (req, res, next) => {
            await this.register(req, res, next);
        });
        app.post('/api/auth/login', async (req, res, next) => {
            await this.login(req, res, next);
        });

        // schools
        app.post('/api/schools', async (req, res, next) => {
            await this.createSchool(req, res, next);
        });
        app.get('/api/schools', async (req, res, next) => {
            await this.getAllSchools(req, res, next);
        });
        app.get('/api/schools/:id', async (req, res, next) => {
            await this.getSingleSchool(req, res, next);
        });
        app.put('/api/schools/:id', async (req, res, next) => {
            await this.updateSchool(req, res, next);
        });
        app.delete('/api/schools/:id', async (req, res, next) => {
            await this.deleteSchool(req, res, next);
        });

        // classrooms
        app.post('/api/classrooms', async (req, res, next) => {
            await this.createClassroom(req, res, next);
        });
        app.get('/api/classrooms/school/:id', async (req, res, next) => {
            await this.getClassroomsBySchool(req, res, next);
        });
        app.put('/api/classrooms/:id', async (req, res, next) => {
            await this.updateClassroom(req, res, next);
        });
        app.delete('/api/classrooms/:id', async (req, res, next) => {
            await this.deleteClassroom(req, res, next);
        });

        // students
        app.post('/api/students', async (req, res, next) => {
            await this.createStudent(req, res, next);
        });
        app.get('/api/students/classroom/:classroomId', async (req, res, next) => {
            await this.getStudentsByClassroom(req, res, next);
        });
        app.put('/api/students/:id', async (req, res, next) => {
            await this.updateStudent(req, res, next);
        });
        app.delete('/api/students/:id', async (req, res, next) => {
            await this.deleteStudent(req, res, next);
        });

        /** a single middleware to handle all */
        app.all('/api/:moduleName/:fnName', this.userApi.mw);

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack)
            res.status(500).send(err.message)
        });

        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
        });
    }

    async register(req, res, next) {
        try {
            const response = await this.user.createUser({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                role: req.body.role,
            });
            return this.responseDispatcher.dispatch(res, {code: 201, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
                msg: err.message
            });
        }
    }

    async login(req, res, next) {
        try {
            const response = await this.user.login({
                email: req.body.email,
                password: req.body.password,
            });
            return this.responseDispatcher.dispatch(res, {code: 200, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
                msg: err.message
            });
        }
    }

    async createSchool(req, res, next) {
        try {
            const response = await this.school.createSchool({
                name: req.body.name,
                address: req.body.address,
            });
            if (response.error) {
                return this.responseDispatcher.dispatch(res, {
                    code: 400,
                    ok: false,
                    errors: [response.result],
                });
            }
            return this.responseDispatcher.dispatch(res, {code: 201, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async updateSchool(req, res, next) {
        try {
            const response = await this.school.updateSchool(req.params.id, {
                name: req.body.name,
                address: req.body.address,
            });
            if (response.error) {
                return this.responseDispatcher.dispatch(res, {
                    code: 400,
                    ok: false,
                    errors: [response.result],
                });
            }
            return this.responseDispatcher.dispatch(res, {code: 200, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async getAllSchools(req, res, next) {
        try {
            const response = await this.school.getAllSchools();
            return this.responseDispatcher.dispatch(res, {code: 200, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async getSingleSchool(req, res, next) {
        try {
            const response = await this.school.getSingleSchool(req.params.id);
            return this.responseDispatcher.dispatch(res, {code: 200, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async deleteSchool(req, res, next) {
        try {
            const response = await this.school.deleteSchool(req.params.id);
            return this.responseDispatcher.dispatch(res, {
                code: 200,
                ok: true,
                data: response,
                message: 'School successfully deleted.'
            });
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async createClassroom(req, res, next) {
        try {
            const response = await this.classroom.createClassroom({
                name: req.body.name,
                capacity: req.body.capacity,
                school: req.body.school,
            });
            if (response.error) {
                return this.responseDispatcher.dispatch(res, {
                    code: 400,
                    ok: false,
                    errors: [response.result],
                });
            }
            return this.responseDispatcher.dispatch(res, {code: 201, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async updateClassroom(req, res, next) {
        try {
            const response = await this.classroom.updateClassroom(req.params.id, {
                name: req.body.name,
                capacity: req.body.capacity,
            });
            if (response.error) {
                return this.responseDispatcher.dispatch(res, {
                    code: 400,
                    ok: false,
                    errors: [response.result],
                });
            }
            return this.responseDispatcher.dispatch(res, {code: 200, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async getClassroomsBySchool(req, res, next) {
        try {
            const response = await this.classroom.getClassroomsBySchool(req.params.id);
            return this.responseDispatcher.dispatch(res, {code: 200, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async deleteClassroom(req, res, next) {
        try {
            const response = await this.classroom.deleteClassroom(req.params.id);
            return this.responseDispatcher.dispatch(res, {
                code: 200,
                ok: true,
                data: response,
                message: 'Classroom successfully deleted.'
            });
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async createStudent(req, res, next) {
        try {
            const response = await this.student.createStudent({
                name: req.body.name,
                age: req.body.age,
                classroom: req.body.classroom,
            });
            if (response.error) {
                return this.responseDispatcher.dispatch(res, {
                    code: 400,
                    ok: false,
                    errors: [response.result],
                });
            }
            return this.responseDispatcher.dispatch(res, {code: 201, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async updateStudent(req, res, next) {
        try {
            const response = await this.student.updateStudent(req.params.id, {
                name: req.body.name,
                age: req.body.age,
            });
            if (response.error) {
                return this.responseDispatcher.dispatch(res, {
                    code: 400,
                    ok: false,
                    errors: [response.result],
                });
            }
            return this.responseDispatcher.dispatch(res, {code: 200, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async getStudentsByClassroom(req, res, next) {
        try {
            const response = await this.student.getStudentsByClassroom(req.params.classroomId);
            return this.responseDispatcher.dispatch(res, {code: 200, ok: true, data: response});
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

    async deleteStudent(req, res, next) {
        try {
            const response = await this.student.deleteStudent(req.params.id);
            return this.responseDispatcher.dispatch(res, {
                code: 200,
                ok: true,
                data: response,
                message: 'Student successfully deleted.'
            });
        } catch (err) {
            return this.responseDispatcher.dispatch(res, {
                code: 400,
                ok: false,
                errors: [err.message],
            });
        }
    }

}
