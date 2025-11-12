const mongoose = require('mongoose');
require('dotenv').config();

module.exports = function(){ 
    const db = process.env.MONGODB_URI;
    mongoose.connect(db)
    .then(() => console.log(`Connected to database...`))
    .catch(err => console.error('Error: Could not connect to MongoDB...', err));
}

