module.exports = class Student {
    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
    }

    async createStudent(studentData) {
        const result = await this.validators.student.createStudent(studentData);
        if (result) return {error: true, result};

        const newStudent = new this.mongomodels.student(studentData);
        const savedStudent = await newStudent.save();

        return {
            student: {
                id: savedStudent._id,
                name: savedStudent.name,
                age: savedStudent.age,
                classroomId: savedStudent.classroom
            },
        };
    }

    async updateStudent(studentId, studentData) {
        const {name, age} = studentData;
        const student = await this.mongomodels.student.findById(studentId);
        if (!student) {
            throw new Error('Student not found.')
        }

        student.name = name || student.name;
        student.age = age || student.age;

        const updatedStudent = await student.save();

        return {
            student: {
                id: updatedStudent._id,
                name: updatedStudent.name,
                age: updatedStudent.age,
                classroomId: updatedStudent.classroom
            },
        };
    }

    async getStudentsByClassroom(classroomId) {
        const students = await this.mongomodels.student.find({classroom: classroomId});

        const formattedStudents = students.map(student => ({
            id: student._id,
            name: student.name,
            age: student.age,
            classroomId: student.classroom
        }));

        return {students: formattedStudents};
    }

    async deleteStudent(studentId) {
        const deletionResult = await this.mongomodels.student.findByIdAndDelete(studentId);

        if (!deletionResult) {
            throw new Error('Student not found.')
        }

        return {};
    }
}
