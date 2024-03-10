const School = require("../../../../managers/entities/school/School.manager");

describe('School Manager', () => {
    let school;
    const mockValidators = {
        school: {
            createSchool: jest.fn()
        }
    };
    const mockMongomodels = {
        school: jest.fn().mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({
                _id: 'mockSchoolId',
                name: 'Test School',
                address: '123 Test Lane'

            }),
        }))
    };

    beforeEach(() => {
        jest.clearAllMocks();

        school = new School({
            utils: {},
            cache: {},
            config: {},
            cortex: {},
            managers: {},
            validators: mockValidators,
            mongomodels: mockMongomodels
        });
    });

    describe('createSchool method', () => {
        it('should create a school successfully', async () => {
            const schoolData = {name: 'Test School', address: '123 Test Lane'};
            mockValidators.school.createSchool(null);

            const result = await school.createSchool({
                name: 'Test School',
                address: '123 Test Lane'
            });

            expect(result).toEqual({
                school: {
                    id: 'mockSchoolId',
                    name: 'Test School',
                    address: '123 Test Lane'
                }
            })
            expect(mockValidators.school.createSchool).toHaveBeenCalledWith(schoolData);
            expect(mockMongomodels.school).toHaveBeenCalled();
        });

        it('should return validation error if validation fails', async () => {
            const mockValidationError = {error: 'Validation failed'};
            mockValidators.school.createSchool.mockResolvedValue(mockValidationError);

            const result = await school.createSchool({
                name: '',
                address: ''
            });

            expect(result).toEqual({error: true, result: mockValidationError});
            expect(mockValidators.school.createSchool).toHaveBeenCalled();
            expect(mockMongomodels.school).not.toHaveBeenCalled();
        });
    });

    describe('updateSchool method', () => {
        const mockSchoolId = 'validSchoolId';
        const mockSchoolData = {name: 'updatedName', address: 'newAddress'};
        const existingSchool = {
            _id: mockSchoolId,
            name: 'originalName',
            address: 'originalAddress',
            save: jest.fn().mockImplementation(function () {
                return Promise.resolve({
                    _id: this._id,
                    name: this.name,
                    address: this.address,
                });
            })
        };

        it('should update a school successfully', async () => {
            mockMongomodels.school.findById = jest.fn().mockResolvedValue(existingSchool);

            const result = await school.updateSchool(mockSchoolId, mockSchoolData);

            expect(result).toEqual({
                school: {
                    id: mockSchoolId,
                    name: mockSchoolData.name,
                    address: mockSchoolData.address,
                }
            });
            expect(mockMongomodels.school.findById).toHaveBeenCalledWith(mockSchoolId);
            expect(existingSchool.save).toHaveBeenCalled();
        });

        it('should throw an error if the school does not exist', async () => {
            mockMongomodels.school.findById = jest.fn().mockResolvedValue(null);

            await expect(school.updateSchool('nonExistingId', mockSchoolData))
                .rejects
                .toThrow('School not found.');
        });
    });

    describe('getAllSchools method', () => {
        const mockSchools = [
            {_id: 'school1', name: 'School One', address: 'Address One'},
            {_id: 'school2', name: 'School Two', address: 'Address Two'}
        ];

        it('should return schools', async () => {
            mockMongomodels.school.find = jest.fn().mockResolvedValue(mockSchools);
            const expectedSchools = mockSchools.map(school => ({
                id: school._id,
                name: school.name,
                address: school.address,
            }));

            const result = await school.getAllSchools();

            expect(result.schools).toEqual(expectedSchools);
            expect(mockMongomodels.school.find).toHaveBeenCalledWith({});
        });

        it('should return an empty array if no schools are found', async () => {
            mockMongomodels.school.find = jest.fn().mockResolvedValue([]);

            const result = await school.getAllSchools('nonexistentClassroom');

            expect(mockMongomodels.school.find).toHaveBeenCalledWith({});
            expect(result.schools).toEqual([]);
        });
    });

    describe('deleteSchool method', () => {
        const mockSchoolId = 'validSchoolId';

        it('should delete a school successfully', async () => {
            mockMongomodels.school.findByIdAndDelete = jest.fn().mockResolvedValue({
                _id: mockSchoolId,
                name: 'School to delete',
                address: 'address',
            });

            const result = await school.deleteSchool(mockSchoolId);

            expect(mockMongomodels.school.findByIdAndDelete).toHaveBeenCalledWith(mockSchoolId);
            expect(result).toEqual({});
        });

        it('should throw an error if the school does not exist', async () => {
            mockMongomodels.school.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            await expect(school.deleteSchool('nonExistingId'))
                .rejects
                .toThrow('School not found.');
        });
    });

    describe('getSingleSchool method', () => {
        const mockSchoolId = 'validSchoolId';

        it('should delete a school successfully', async () => {
            mockMongomodels.school.findById = jest.fn().mockResolvedValue({
                _id: mockSchoolId,
                name: 'School to delete',
                address: 'address',
            });

            const result = await school.getSingleSchool(mockSchoolId);

            expect(mockMongomodels.school.findById).toHaveBeenCalledWith(mockSchoolId);
            expect(result).toEqual({
                school: {
                    id: mockSchoolId,
                    name: 'School to delete',
                    address: 'address',
                }
            });
        });

        it('should throw an error if the school does not exist', async () => {
            mockMongomodels.school.findById = jest.fn().mockResolvedValue(null);

            await expect(school.getSingleSchool('nonExistingId'))
                .rejects
                .toThrow('School not found.');
        });
    });
});
