// prince 
const mongoose = require('mongoose');
const DataSchema = new mongoose.Schema({
    car_name: {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    company:{
        type: String,
        minlength: 2,
        maxlength: 10
    },
    car_year: Number,
    model :{
        type: String,
        minlength: 2,
        maxlength: 10
    },
    colour :{
        type: String,
        minlength: 2,
        maxlength: 10
    },
    vin_no :Number,
    car_price : Number,
    engine: {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    type : {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    pre_owned:{
        type: String,
        minlength: 2,
        maxlength: 10
    },
    fuel_type :{
        type: String,
        minlength: 2,
        maxlength: 10
    },
    extra : {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    financing : {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    sale: {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    
    posted_by : {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    updated_by: {
        type: String,
        minlength: 2,
        maxlength: 10
    },
    updated_last : {
        type: String,
        minlength: 2,
        maxlength: 30
    },
    filename: {
        type: String,
        minlength: 2,
        maxlength: 30
    },
    originalname: {
        type: String,
        minlength: 2,
        maxlength: 30
    },
    path: String
});
const data = mongoose.model('data', DataSchema);
module.exports = data;
