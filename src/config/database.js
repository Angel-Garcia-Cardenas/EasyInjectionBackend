const mongoose = require('mongoose');
require('dotenv').config();

module.exports = function(){ 
    const db = process.env.MONGODB_URI;
    mongoose.connect(db)
        .then(() => {
            // Connected to database
        })
        .catch(err => {
            // Error connecting to MongoDB
        });
}

