const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    age: {type: Number, required: true},
    classroom: {type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true},
});

module.exports = mongoose.model('Student', StudentSchema);
