const User = require("../../../../managers/entities/user/User.manager");

describe('User Manager', () => {
    let user;

    const mockUtils = {};
    const mockCache = {};
    const mockConfig = {};
    const mockCortex = {};
    const mockValidators = {
        user: {
            createUser: jest.fn()
        }
    };
    const mockTokenManager = {
        genLongToken: jest.fn().mockReturnValue('mockLongToken')
    };
    const mockMongomodels = {
        user: jest.fn().mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({
                _id: 'mockId',
                key: 'mockKey',
                username: 'testuser',
                email: 'test@example.com',
                password: 'password'
            })
        }))
    };
    const mockManagers = {
        token: mockTokenManager
    };

    beforeEach(() => {
        jest.clearAllMocks();

        user = new User({
            utils: mockUtils,
            cache: mockCache,
            config: mockConfig,
            cortex: mockCortex,
            managers: mockManagers,
            validators: mockValidators,
            mongomodels: mockMongomodels
        });
    });

    describe('createUser method', () => {
        it('should create a user successfully', async () => {
            mockValidators.user.createUser.mockResolvedValue(null);

            const result = await user.createUser({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password'
            });

            expect(result.user.username).toEqual('testuser');
            expect(result.user.email).toEqual('test@example.com');
            expect(result.longToken).toEqual('mockLongToken');
            expect(mockMongomodels.user).toHaveBeenCalled();
            expect(mockTokenManager.genLongToken).toHaveBeenCalledWith({
                userId: 'mockId',
                userKey: 'mockKey'
            });
        });

        it('should return validation error if validation fails', async () => {
            const mockValidationError = {error: 'Validation failed'};
            mockValidators.user.createUser.mockResolvedValue(mockValidationError);

            const result = await user.createUser({
                username: '',
                email: 'test@example.com',
                password: 'password'
            });

            expect(result).toEqual(mockValidationError);
            expect(mockValidators.user.createUser).toHaveBeenCalled();
            expect(mockMongomodels.user).not.toHaveBeenCalled();
        });
    });
});
