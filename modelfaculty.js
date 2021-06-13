
const mongoose = require('mongoose');
// creat schema adduserSchema=================================

const addfacultySchema = new mongoose.Schema({
    name: String,
    email: String,
    User: String
});

// creat schema adduserSchema=================================


module.exports = new mongoose.model('Facultys_List', addfacultySchema);