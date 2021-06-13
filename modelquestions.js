
const mongoose = require('mongoose');
// creat schema adduserSchema=================================

const addquestionSchema = new mongoose.Schema({
    question: String,
});

// creat schema adduserSchema=================================


module.exports = new mongoose.model('Questions_List', addquestionSchema);