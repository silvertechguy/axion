module.exports = class Classroom {
    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
    }

    async createClassroom(classroomData) {
        const result = await this.validators.classroom.createClassroom(classroomData);
        if (result) return {error: true, result};

        const newClassroom = new this.mongomodels.classroom(classroomData);
        const savedClassroom = await newClassroom.save();

        return {
            classroom: {
                id: savedClassroom._id,
                name: savedClassroom.name,
                capacity: savedClassroom.capacity,
                schoolId: savedClassroom.school
            },
        };
    }

    async updateClassroom(classroomId, classData) {
        const {name, capacity} = classData;
        const classroom = await this.mongomodels.classroom.findById(classroomId);
        if (!classroom) {
            throw new Error('Classroom not found.')
        }

        classroom.name = name || classroom.name;
        classroom.capacity = capacity || classroom.capacity;

        const updatedClassroom = await classroom.save();

        return {
            classroom: {
                id: updatedClassroom._id,
                name: updatedClassroom.name,
                capacity: updatedClassroom.capacity,
                schoolId: updatedClassroom.school
            },
        };
    }

    async getClassroomsBySchool(schoolId) {
        const classrooms = await this.mongomodels.classroom.find({school: schoolId});

        const formattedClassrooms = classrooms.map(classroom => ({
            id: classroom._id,
            name: classroom.name,
            capacity: classroom.capacity,
            schoolId: classroom.school
        }));

        return {classrooms: formattedClassrooms};
    }

    async deleteClassroom(classroomId) {
        const deletionResult = await this.mongomodels.classroom.findByIdAndDelete(classroomId);

        if (!deletionResult) {
            throw new Error('Classroom not found.')
        }

        return {};
    }
}
