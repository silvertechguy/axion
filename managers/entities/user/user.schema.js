module.exports = {
    createUser: [
        {
            model: 'username',
            required: true,
        },
    ],
    login: [
        {
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
    ],
}


