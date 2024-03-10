const Student = require("../../../../managers/entities/student/Student.manager");

describe('Student Manager', () => {
    let student;
    const mockValidators = {
        student: {
            createStudent: jest.fn()
        }
    };
    const mockMongomodels = {
        student: jest.fn().mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({
                _id: 'id',
                name: 'ahmed',
                age: 20,
                classroom: 'classroomId'
            }),
        }))
    };

    beforeEach(() => {
        jest.clearAllMocks();

        student = new Student({
            utils: {},
            cache: {},
            config: {},
            cortex: {},
            managers: {},
            validators: mockValidators,
            mongomodels: mockMongomodels
        });
    });

    describe('createStudent method', () => {
        it('should create a student successfully', async () => {
            mockValidators.student.createStudent.mockResolvedValue(null);

            const result = await student.createStudent({
                name: 'ahmed',
                age: 20,
                classroom: 'classroomId'
            });

            expect(result.student.name).toEqual('ahmed');
            expect(result.student.age).toEqual(20);
            expect(result.student.classroomId).toEqual('classroomId');
            expect(mockValidators.student.createStudent).toHaveBeenCalled();
            expect(mockMongomodels.student).toHaveBeenCalled();
        });

        it('should return validation error if validation fails', async () => {
            const mockValidationError = {error: 'Validation failed'};
            mockValidators.student.createStudent.mockResolvedValue(mockValidationError);

            const result = await student.createStudent({
                name: '',
                age: 20,
                classroom: 'classroomId'
            });

            expect(result).toEqual({error: true, result: mockValidationError});
            expect(mockValidators.student.createStudent).toHaveBeenCalled();
            expect(mockMongomodels.student).not.toHaveBeenCalled();
        });
    });

    describe('updateStudent method', () => {
        const mockStudentId = 'validStudentId';
        const mockStudentData = {name: 'updatedName', age: 21};
        const existingStudent = {
            _id: mockStudentId,
            name: 'originalName',
            age: 20,
            classroom: 'classroomId',
            save: jest.fn().mockImplementation(function () {
                return Promise.resolve({
                    _id: this._id,
                    name: this.name,
                    age: this.age,
                    classroom: this.classroom,
                });
            })
        };

        it('should update a student successfully', async () => {
            mockMongomodels.student.findById = jest.fn().mockResolvedValue(existingStudent);

            const result = await student.updateStudent(mockStudentId, mockStudentData);

            expect(result.student.id).toEqual(mockStudentId);
            expect(result.student.name).toEqual(mockStudentData.name);
            expect(result.student.age).toEqual(mockStudentData.age);
            expect(result.student.classroomId).toEqual(existingStudent.classroom);

            expect(mockMongomodels.student.findById).toHaveBeenCalledWith(mockStudentId);
            expect(existingStudent.save).toHaveBeenCalled();
        });

        it('should throw an error if the student does not exist', async () => {
            mockMongomodels.student.findById = jest.fn().mockResolvedValue(null);

            await expect(student.updateStudent('nonExistingId', mockStudentData))
                .rejects
                .toThrow('Student not found.');
        });
    });

    describe('getStudentsByClassroom method', () => {
        const mockClassroomId = 'classroomId';
        const mockStudents = [
            {_id: 'student1', name: 'Student One', age: 15, classroom: mockClassroomId},
            {_id: 'student2', name: 'Student Two', age: 16, classroom: mockClassroomId}
        ];

        it('should return students for a given classroom', async () => {
            mockMongomodels.student.find = jest.fn().mockResolvedValue(mockStudents);
            const expectedStudents = mockStudents.map(student => ({
                id: student._id,
                name: student.name,
                age: student.age,
                classroomId: student.classroom
            }));

            const result = await student.getStudentsByClassroom(mockClassroomId);

            expect(mockMongomodels.student.find).toHaveBeenCalledWith({classroom: mockClassroomId});
            expect(result.students).toEqual(expectedStudents);
        });

        it('should return an empty array if no students are found for the classroom', async () => {
            mockMongomodels.student.find = jest.fn().mockResolvedValue([]);

            const result = await student.getStudentsByClassroom('nonexistentClassroom');

            expect(mockMongomodels.student.find).toHaveBeenCalledWith({classroom: 'nonexistentClassroom'});
            expect(result.students).toEqual([]);
        });
    });

    describe('deleteStudent method', () => {
        const mockStudentId = 'validStudentId';

        it('should delete a student successfully', async () => {
            mockMongomodels.student.findByIdAndDelete = jest.fn().mockResolvedValue({
                _id: mockStudentId,
                name: 'Student to delete',
                age: 20,
                classroom: 'classroomId'
            });

            const result = await student.deleteStudent(mockStudentId);

            expect(mockMongomodels.student.findByIdAndDelete).toHaveBeenCalledWith(mockStudentId);
            expect(result).toEqual({});
        });

        it('should throw an error if the student does not exist', async () => {
            mockMongomodels.student.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            await expect(student.deleteStudent('nonExistingId'))
                .rejects
                .toThrow('Student not found.');
        });
    });
});
