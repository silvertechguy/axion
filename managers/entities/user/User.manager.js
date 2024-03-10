module.exports = class User {

    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "users";
        this.userExposed = ['createUser'];
    }

    async createUser({username, email, password, role}) {
        // TODO: password should be hashed not saved as plain text.
        const user = {username, email, password, role};
        user.role = this._setRole(role)

        // Data validation
        const result = await this.validators.user.createUser(user);
        if (result) return result;

        // Creation Logic
        const userModel = new this.mongomodels.user(user);
        const createdUser = await userModel.save();
        // TODO: Remove key
        const longToken = this.tokenManager.genLongToken({userId: createdUser._id, userKey: createdUser.key});

        // Response
        return {
            user: {username: createdUser.username, email: createdUser.email, role: createdUser.role},
            longToken
        };
    }

    async login(request) {
        const result = await this.validators.user.login(request);
        if (result) return result;

        const user = await this._findByEmailOrThrow(request.email)

        // TODO: Hande password validation logic
        // TODO: Remove key
        const longToken = this.tokenManager.genLongToken({userId: user._id, userKey: user.key});

        // Response
        return {
            user: {username: user.username, email: user.role, role: user.role},
            longToken
        };
    }

    _setRole(role) {
        const validRoles = ['superadmin', 'schooladmin'];
        if (!role || !validRoles.includes(role)) {
            return validRoles[0];
        }
        return role;
    }

    async _findByEmailOrThrow(email) {
        const user = await this.mongomodels.user.findOne({email}).lean(true).exec();
        if (!user) throw new Error('Invalid email or password');
        return user;
    }

}
