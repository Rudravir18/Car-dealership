// harsh
const mongoose = require('mongoose');
const ProfileSchema = new mongoose.Schema({
    username :{
        type: String,
        minlength: 2,
        maxlength: 10
    },
    password: {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    fname : {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    lname: {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    email: {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    contact: {
        type: Number,
        minlength: 2,
        maxlength: 10
    },
    role: {
        type: String,
        minlength: 2,
        maxlength: 10
    },
});
const profile = mongoose.model('profile', ProfileSchema);

module.exports = profile;