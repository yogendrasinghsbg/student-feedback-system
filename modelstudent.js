
const mongoose = require('mongoose');
// creat schema adduserSchema=================================

const adduserSchema = new mongoose.Schema({
    name: String,
    email: String,
    enrollment_no: String,
    User: String
});

// creat schema adduserSchema=================================


module.exports = new mongoose.model('Student_List', adduserSchema);