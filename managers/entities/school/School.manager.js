module.exports = class School {
    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
    }

    async createSchool(schoolData) {
        const result = await this.validators.school.createSchool(schoolData);
        if (result) return {error: true, result};

        const newSchool = new this.mongomodels.school(schoolData);
        const savedSchool = await newSchool.save();

        return {
            school: {
                id: savedSchool._id,
                name: savedSchool.name,
                address: savedSchool.address
            },
        };
    }

    async updateSchool(schoolId, schoolData) {
        const {name, address} = schoolData;
        const school = await this.mongomodels.school.findById(schoolId);
        if (!school) {
            throw new Error('School not found.')
        }

        school.name = name || school.name;
        school.address = address || school.address;

        const updatedSchool = await school.save();

        return {
            school: {
                id: updatedSchool._id,
                name: updatedSchool.name,
                address: updatedSchool.address
            },
        };
    }

    async getAllSchools() {
        const schools = await this.mongomodels.school.find({});

        const formattedSchools = schools.map(school => ({
            id: school._id,
            name: school.name,
            address: school.address
        }));

        return {
            schools: formattedSchools
        };
    }

    async getSingleSchool(schoolId) {
        const school = await this.mongomodels.school.findById(schoolId);

        if (!school) {
            throw new Error('School not found.')
        }

        return {
            school: {
                id: school._id,
                name: school.name,
                address: school.address
            },
        };
    }

    async deleteSchool(schoolId) {
        const deletionResult = await this.mongomodels.school.findByIdAndDelete(schoolId);

        if (!deletionResult) {
            throw new Error('School not found.')
        }

        return {};
    }
}
