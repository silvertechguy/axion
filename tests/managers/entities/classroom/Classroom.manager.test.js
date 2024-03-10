const Classroom = require("../../../../managers/entities/classroom/Classroom.manager");

describe('Classroom Manager', () => {
    let classroom;
    const mockValidators = {
        classroom: {
            createClassroom: jest.fn()
        }
    };
    const mockMongomodels = {
        classroom: jest.fn().mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({
                _id: 'id',
                name: 'a',
                capacity: 20,
                school: 'schoolId'
            }),
        }))
    };

    beforeEach(() => {
        jest.clearAllMocks();

        classroom = new Classroom({
            utils: {},
            cache: {},
            config: {},
            cortex: {},
            managers: {},
            validators: mockValidators,
            mongomodels: mockMongomodels
        });
    });

    describe('createClassroom method', () => {
        it('should create a classroom successfully', async () => {
            mockValidators.classroom.createClassroom.mockResolvedValue(null);

            const result = await classroom.createClassroom({
                name: 'a',
                capacity: 20,
                school: 'schoolId'
            });

            expect(result).toEqual({
                classroom: {
                    id: 'id',
                    name: 'a',
                    capacity: 20,
                    schoolId: 'schoolId'
                }
            })
            expect(mockValidators.classroom.createClassroom).toHaveBeenCalled();
            expect(mockMongomodels.classroom).toHaveBeenCalled();
        });

        it('should return validation error if validation fails', async () => {
            const mockValidationError = {error: 'Validation failed'};
            mockValidators.classroom.createClassroom.mockResolvedValue(mockValidationError);

            const result = await classroom.createClassroom({
                name: '',
            });

            expect(result).toEqual({error: true, result: mockValidationError});
            expect(mockValidators.classroom.createClassroom).toHaveBeenCalled();
            expect(mockMongomodels.classroom).not.toHaveBeenCalled();
        });
    });

    describe('updateClassroom method', () => {
        const mockClassroomId = 'validStudentId';
        const mockClassroomData = {name: 'updatedName', capacity: 21};
        const existingClassroom = {
            _id: mockClassroomId,
            name: 'originalName',
            capacity: 20,
            school: 'schoolId',
            save: jest.fn().mockImplementation(function () {
                return Promise.resolve({
                    _id: this._id,
                    name: this.name,
                    capacity: this.capacity,
                    school: this.school,
                });
            })
        };

        it('should update a classroom successfully', async () => {
            mockMongomodels.classroom.findById = jest.fn().mockResolvedValue(existingClassroom);

            const result = await classroom.updateClassroom(mockClassroomId, mockClassroomData);

            expect(result).toEqual({
                classroom: {
                    id: mockClassroomId,
                    name: mockClassroomData.name,
                    capacity: mockClassroomData.capacity,
                    schoolId: existingClassroom.school,
                }
            });

            expect(mockMongomodels.classroom.findById).toHaveBeenCalledWith(mockClassroomId);
            expect(existingClassroom.save).toHaveBeenCalled();
        });

        it('should throw an error if the classroom does not exist', async () => {
            mockMongomodels.classroom.findById = jest.fn().mockResolvedValue(null);

            await expect(classroom.updateClassroom('nonExistingId', mockClassroomData))
                .rejects
                .toThrow('Classroom not found.');
        });
    });

    describe('getClassroomsBySchool method', () => {
        const mockSchoolId = 'classroomId';
        const mockClassrooms = [
            {_id: 'classroom1', name: 'Classroom One', capacity: 15, school: mockSchoolId},
            {_id: 'classroom2', name: 'Classroom Two', capacity: 16, school: mockSchoolId}
        ];

        it('should return classrooms for a given school', async () => {
            mockMongomodels.classroom.find = jest.fn().mockResolvedValue(mockClassrooms);
            const expectedClassrooms = mockClassrooms.map(mockClassroom => ({
                id: mockClassroom._id,
                name: mockClassroom.name,
                capacity: mockClassroom.capacity,
                schoolId: mockClassroom.school
            }));

            const result = await classroom.getClassroomsBySchool(mockSchoolId);

            expect(mockMongomodels.classroom.find).toHaveBeenCalledWith({school: mockSchoolId});
            expect(result.classrooms).toEqual(expectedClassrooms);
        });

        it('should return an empty array if no classrooms are found for the school', async () => {
            mockMongomodels.classroom.find = jest.fn().mockResolvedValue([]);

            const result = await classroom.getClassroomsBySchool('nonexistentSchool');

            expect(mockMongomodels.classroom.find).toHaveBeenCalledWith({school: 'nonexistentSchool'});
            expect(result.classrooms).toEqual([]);
        });
    });

    describe('deleteClassroom method', () => {
        const mockClassroomId = 'validClassroomId';

        it('should delete a student successfully', async () => {
            mockMongomodels.classroom.findByIdAndDelete = jest.fn().mockResolvedValue({
                _id: mockClassroomId,
                name: 'Classroom to delete',
                age: 20,
                classroom: 'classroomId'
            });

            const result = await classroom.deleteClassroom(mockClassroomId);

            expect(mockMongomodels.classroom.findByIdAndDelete).toHaveBeenCalledWith(mockClassroomId);
            expect(result).toEqual({});
        });

        it('should throw an error if the student does not exist', async () => {
            mockMongomodels.classroom.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            await expect(classroom.deleteClassroom('nonExistingId'))
                .rejects
                .toThrow('Classroom not found.');
        });
    });
});
